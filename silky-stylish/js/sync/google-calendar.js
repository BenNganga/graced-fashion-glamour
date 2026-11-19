/* Silky Stylish / js/sync/google-calendar.js
   Automatic Google Calendar sync (connect, create, update and delete events). */
'use strict';

var G={token:null,exp:0,client:null,email:'',status:'',dirty:false,chain:Promise.resolve()};
function gId(){return (S.settings&&S.settings.gClientId)||'';}
function gConnected(){return !!G.token&&Date.now()<G.exp;}
function gSet(msg){G.status=msg;if(tab==='cal'&&!document.getElementById('mf'))render();}
if(!G.status)G.status=gId()?'Not connected yet. Tap Connect Google Calendar.':'Not set up yet. Tap Set up and paste your Google Client ID.';
function gFetch(method,url,body){
  return fetch(url,{method:method,headers:{'Authorization':'Bearer '+G.token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}).then(function(r){
    return r.text().then(function(t){var j=null;try{j=t?JSON.parse(t):null;}catch(e){}if(r.status===401)G.token=null;return {ok:r.ok,status:r.status,body:j};});
  });
}
function loadGis(cb){
  if(window.google&&google.accounts&&google.accounts.oauth2)return cb();
  var sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';sc.async=true;sc.onload=cb;
  sc.onerror=function(){gSet('Could not load Google sign-in. Check your internet connection and try again.');};
  document.head.appendChild(sc);
}
function gConnect(){
  var cid=gId();
  if(!cid){gSettings();return;}
  if(location.protocol==='file:'){gSet('Google sign-in does not work when the file is opened by double-click. Open the app with Live Server (an address starting with http) and connect again.');return;}
  loadGis(function(){
    G.client=google.accounts.oauth2.initTokenClient({
      client_id:cid,
      scope:'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
      callback:function(resp){
        if(resp.error){gSet('Google sign-in did not finish ('+resp.error+').');return;}
        G.token=resp.access_token;G.exp=Date.now()+((resp.expires_in||3600)-60)*1000;
        gFetch('GET','https://www.googleapis.com/oauth2/v3/userinfo').then(function(r){
          G.email=((r.body&&r.body.email)||'').toLowerCase();
          if(G.email!==CAL_ACCOUNT){G.token=null;gSet('You signed in as '+(G.email||'another account')+'. Events must go to '+CAL_ACCOUNT+', so sign in with that account.');return;}
          gSet('Connected to '+G.email+'.');gSyncAll();
        }).catch(function(){G.token=null;gSet('Could not confirm the Google account. Try again.');});
      }
    });
    G.client.requestAccessToken({login_hint:CAL_ACCOUNT});
  });
}
function evId(no,kind){return 'gfgsk'+String(no).replace(/\D/g,'')+kind;}
function orderEvents(o){
  var base=o.no+' '+o.client+' ('+(o.outfit||'order')+')',tail='Tailor: '+(o.tailor||'not assigned')+'.',ev={};
  function allDay(title,k,desc){return {summary:title,description:desc,start:{date:k},end:{date:addDays(1,k)},reminders:{useDefault:false,overrides:[{method:'popup',minutes:900},{method:'popup',minutes:3780}]}};}
  if(o.fit1)ev.fit1=allDay('Fitting 1: '+base,o.fit1,'Fitting for '+o.client+'. '+tail);
  if(o.fit2)ev.fit2=allDay('Fitting 2: '+base,o.fit2,'Second fitting for '+o.client+'. '+tail);
  if(o.pickup)ev.pick=allDay('Pick-up: '+base,o.pickup,o.client+' collects. Balance due: '+kes(balance(o))+'.');
  var from=o.date>todayIso()?o.date:todayIso();
  if(active(o)&&o.status!=='Ready'&&o.pickup&&o.pickup>=from){
    var n=Math.round((parse(o.pickup)-parse(from))/86400000)+1;
    ev.make={summary:'Being made: '+base,description:'Daily check. Pick-up is '+fmtFull(o.pickup)+'. '+tail,start:{dateTime:from+'T08:00:00+03:00',timeZone:'Africa/Nairobi'},end:{dateTime:from+'T08:15:00+03:00',timeZone:'Africa/Nairobi'},recurrence:['RRULE:FREQ=DAILY;COUNT='+n],reminders:{useDefault:false,overrides:[{method:'popup',minutes:0}]}};
  }
  return ev;
}
function gUpsert(id,body){
  return gFetch('PUT',CAL_API+'/'+id,Object.assign({id:id,status:'confirmed'},body)).then(function(r){
    if(r.status!==404&&r.status!==410)return r;
    return gFetch('POST',CAL_API,Object.assign({id:id},body)).then(function(r2){
      if(r2.status===409)return gFetch('PUT',CAL_API+'/'+id,Object.assign({id:id,status:'confirmed'},body));
      return r2;
    });
  });
}
function gRemoveIds(no){
  return Promise.all(['fit1','fit2','pick','make'].map(function(k){return gFetch('DELETE',CAL_API+'/'+evId(no,k));}));
}
function gSyncOrder(o){
  var want=orderEvents(o);
  return Promise.all(['fit1','fit2','pick','make'].map(function(k){return want[k]?gUpsert(evId(o.no,k),want[k]):gFetch('DELETE',CAL_API+'/'+evId(o.no,k));})).then(function(rs){
    var bad=rs.filter(function(r){return !(r.ok||r.status===404||r.status===410);})[0];
    return bad?{ok:false,err:'Google replied '+bad.status+(bad.body&&bad.body.error&&bad.body.error.message?' ('+bad.body.error.message+')':'')}:{ok:true};
  });
}
function gQueue(fn){G.chain=G.chain.then(fn).catch(function(){});return G.chain;}
function gSyncSoon(id){
  setTimeout(function(){
    var o=byId(id);if(!o)return;
    if(!gConnected()){G.dirty=true;gSet('Not connected, so this change is not in Google Calendar yet. Connect, then tap Sync all orders now.');return;}
    gQueue(function(){return gSyncOrder(o).then(function(r){if(r.ok)gSet('Connected to '+G.email+'. Last change synced at '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})+'.');else gSet('Could not sync: '+r.err);});});
  },0);
}
function gRemoveOrder(o){
  if(gConnected())gQueue(function(){return gRemoveIds(o.no);});
  else{S.settings.gRemoveNos.push(o.no);save();G.dirty=true;}
}
function gSyncAll(){
  if(!gConnected()){gSet('Not connected. Tap Connect Google Calendar first.');return;}
  gSet('Syncing...');
  var list=S.orders.filter(function(o){return o.status!=='Picked up'||diffDays(o.doneDate||todayIso())>-14;}),fails=0,done=0;
  gQueue(function(){
    var p=Promise.resolve();
    S.settings.gRemoveNos.forEach(function(no){p=p.then(function(){return gRemoveIds(no);});});
    list.forEach(function(o){p=p.then(function(){return gSyncOrder(o).then(function(r){if(r.ok)done++;else fails++;});});});
    return p.then(function(){
      S.settings.gRemoveNos=[];save();G.dirty=fails>0;
      gSet(fails?('Synced '+done+' orders, '+fails+' failed. Tap Sync all orders now to try again.'):('Connected to '+G.email+'. All '+done+' orders synced at '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})+'.'));
    });
  });
}
function gSettings(){
  var intro='<p class="sub">Set up once. You need a free Google Cloud project.</p><ol style="margin:0 0 12px;padding-left:20px;font-size:13px;color:var(--muted)"><li>Open console.cloud.google.com and create a project.</li><li>Turn on the Google Calendar API.</li><li>OAuth consent screen: choose External and add '+esc(CAL_ACCOUNT)+' as a test user.</li><li>Credentials, Create credentials, OAuth client ID, Web application.</li><li>Under Authorised JavaScript origins add the address you open this app from, for example http://127.0.0.1:5500 when using Live Server. A double-clicked file will not work.</li><li>Paste the Client ID below.</li></ol>';
  openForm('Google Calendar setup',[{id:'cid',label:'Google Client ID',value:gId()}],function(v){S.settings.gClientId=v.cid.trim();G.status=S.settings.gClientId?'Not connected yet. Tap Connect Google Calendar.':'Not set up yet. Tap Set up and paste your Google Client ID.';},'Save',intro);
}
function gsyncPanel(){
  var conn=gConnected();
  var h='<h3>Google Calendar sync</h3><div class="note" style="display:block"><p style="margin:0 0 4px"><b>'+esc(CAL_ACCOUNT)+'</b></p><p style="margin:0 0 10px" role="status">'+esc(G.status)+'</p><div class="links"><button class="btn primary sm" data-act="gConnect">'+(conn?'Reconnect':'Connect Google Calendar')+'</button>'+(conn?'<button class="btn sm" data-act="gSyncAll">Sync all orders now</button>':'')+'<button class="btn sm" data-act="gSettings">'+(gId()?'Change Client ID':'Set up')+'</button></div></div>';
  h+='<div class="note" style="display:block"><p style="margin:0 0 6px">Once connected, every order you add or change is copied to that calendar: Fitting 1, Fitting 2 and the pick-up day (reminders at 9am the day before and 9am three days before), plus an 8am "Being made" reminder each day until pick-up.</p><p style="margin:0">Without the connection you can still add one order at a time with the calendar buttons inside each order. They open Google Calendar for '+esc(CAL_ACCOUNT)+' with the event filled in.</p></div>';
  return h;
}
