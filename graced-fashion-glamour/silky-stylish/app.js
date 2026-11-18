(function(){
'use strict';
/* Only signed-in Silky Stylish users get past this line. */
if(!GFG_AUTH.require('silky-stylish'))return;
var KEY='silky-stylish-v1';
var STATUSES=['New','Cutting','Sewing','Fitting','Ready','Picked up'];
var TABS=[['dash','Dashboard'],['orders','Orders'],['track','Track Orders'],['rev','Revenue'],['cal','Calendar']];
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parse(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function todayIso(){return iso(new Date());}
function addDays(n,from){var d=from?parse(from):new Date();d.setDate(d.getDate()+n);return iso(d);}
function diffDays(s){return Math.round((parse(s)-parse(todayIso()))/86400000);}
function fmtDate(s){return s?parse(s).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}):'Not set';}
function fmtFull(s){return s?parse(s).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'Not set';}
function kes(n){return 'KES '+Math.round(n).toLocaleString('en-KE');}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return 'x'+Math.random().toString(36).slice(2,9);}
function num(v){var n=parseFloat(v);return isNaN(n)?0:n;}
function pad(n){return n<100?String(n).padStart(2,'0'):String(n);}
function load(k){try{var r=localStorage.getItem(k);if(r)return JSON.parse(r);}catch(e){}return null;}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

/* ---------- order maths ---------- */
function received(o){return o.deposit+o.adds.reduce(function(a,m){return a+m.amt;},0);}
function balance(o){return Math.max(0,o.total-received(o));}
function expenses(o){return o.material+o.tailorPay+o.misc;}
function profit(o){return o.total-expenses(o);}
function active(o){return o.status!=='Picked up';}
function pickLabel(o){
  if(!o.pickup)return {t:'No pick-up date',c:''};
  if(!active(o))return {t:'Picked up',c:'good'};
  var d=diffDays(o.pickup);
  if(d<0)return {t:Math.abs(d)+'d overdue',c:'bad'};
  if(d===0)return {t:'Pick-up today',c:'warn'};
  if(d<=3)return {t:'Pick-up in '+d+'d',c:'warn'};
  return {t:'Pick-up '+fmtDate(o.pickup),c:''};
}

function sample(){
  var T=['Grace Mwende','Joseph Kimani','Lydia Ouko'];
  var o=[
    ['Amina Wanjiru','Wedding gown, ivory lace',48000,-30,5,-14,-3,'Grace Mwende',25000,12000,9000,9000,5000,'Sewing'],
    ['Mercy Achieng','Kitenge two-piece set',9500,-6,3,-1,1,'Joseph Kimani',5000,0,2200,2500,300,'Fitting'],
    ['Faith Njeri','Bridesmaid dresses x4',32000,-3,12,6,9,'Lydia Ouko',16000,0,11000,8000,500,'Cutting'],
    ['Linet Cheruiyot','Official trouser suit',14000,-20,-2,-12,-6,'Joseph Kimani',7000,7000,4000,3500,200,'Ready']
  ].map(function(x,i){return {id:'o'+i,seq:i+1,no:'GFG-'+pad(i+1),client:x[0],phone:'07'+String(10000000+i*1379421).slice(0,8),outfit:x[1],total:x[2],date:addDays(x[3]),pickup:addDays(x[4]===5?x[4]+12:x[4]===3?x[4]+3:x[4]),fit1:addDays(x[5]+(i===0?7:0)),fit2:addDays(x[6]+(i===0?10:0)),tailor:x[7],deposit:x[8],adds:x[9]?[{id:'a'+i,amt:x[9],date:addDays(-5),note:'Second payment'}]:[],material:x[10],tailorPay:x[11],misc:x[12],status:x[13],notes:''};});
  return {orders:o,tailors:T,nextSeq:5,sample:true};
}
var S=load(KEY);
if(!S||!S.orders)S=sample();
function save(){store(KEY,S);}

var tab='dash',orderFilter='Active',orderQ='',calMonth=new Date(),calSel=todayIso(),pendingView=null,pendingWA=null,revPeriod='day';
calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth(),1);
function byId(id){return S.orders.filter(function(o){return o.id===id;})[0];}

/* ---------- phone calendar links (Google Calendar) ---------- */
function ymd(s){return s.replace(/-/g,'');}
function gcal(title,start,end,details,recurCount){
  var u='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(title)+'&dates='+ymd(start)+'/'+ymd(addDays(1,end||start))+'&details='+encodeURIComponent(details||'');
  if(recurCount>1)u+='&recur='+encodeURIComponent('RRULE:FREQ=DAILY;COUNT='+recurCount);
  return u;
}
function calLinks(o){
  var base=o.no+' '+o.client+' ('+o.outfit+')',out=[];
  var from=diffDays(o.date)>0?o.date:todayIso();
  if(o.pickup&&diffDays(o.pickup)>0){
    var endMake=addDays(-1,o.pickup),days=Math.round((parse(endMake)-parse(from))/86400000)+1;
    if(days>=1)out.push(['Daily making reminders',gcal('Being made: '+base,from,from,'Daily reminder. Pick-up is '+fmtFull(o.pickup)+'. Tailor: '+(o.tailor||'not assigned')+'.',days)]);
  }
  if(o.fit1)out.push(['Fitting 1',gcal('Fitting 1: '+base,o.fit1,o.fit1,'Fitting for '+o.client+'. Tailor: '+(o.tailor||'not assigned')+'.')]);
  if(o.fit2)out.push(['Fitting 2',gcal('Fitting 2: '+base,o.fit2,o.fit2,'Second fitting for '+o.client+'.')]);
  if(o.pickup)out.push(['Pick-up day',gcal('Pick-up: '+base,o.pickup,o.pickup,o.client+' collects. Balance due: '+kes(balance(o))+'.')]);
  return out;
}
function linkRow(o){return '<div class="links">'+calLinks(o).map(function(l){return '<a class="btn sm" target="_blank" rel="noopener" href="'+esc(l[1])+'">'+esc(l[0])+'</a>';}).join('')+'</div>';}

/* ---------- events for calendar and dashboard ---------- */
function eventsOn(k){
  var ev=[];
  S.orders.forEach(function(o){
    if(o.fit1===k)ev.push({kind:'fit',label:'Fitting 1',o:o});
    if(o.fit2===k)ev.push({kind:'fit',label:'Fitting 2',o:o});
    if(o.pickup===k)ev.push({kind:'pick',label:'Pick-up',o:o});
  });
  return ev;
}
function making(k){return S.orders.filter(function(o){return active(o)&&o.date<=k&&(!o.pickup||k<=o.pickup)&&o.status!=='Ready';});}

/* ---------- business contact, Google Calendar sync, WhatsApp ---------- */
var BIZ_PHONE='+254703497229',CAL_ID='gracednjoki94l@gmail.com',SCOPE='https://www.googleapis.com/auth/calendar.events';
var G={token:null,exp:0,client:null,next:null,busy:false},gsiCbs=null;
function toast(m){
  var t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t);}
  t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true;},6000);
}
function migrate(){
  S.expenses=S.expenses||[];S.archive=S.archive||[];
  S.orders.forEach(function(o){o.adds=o.adds||[];o.gcal=o.gcal||{};if(o.status==='Picked up'&&!o.completedAt)o.completedAt=todayIso();});
  purge();save();
}

/* ---------- money ledger (kept even after completed orders are deleted) ---------- */
function archiveOrder(o){
  S.archive.push({d:o.date,i:o.deposit,o:expenses(o),n:1});
  o.adds.forEach(function(m){S.archive.push({d:m.date,i:m.amt,o:0,n:0});});
}
function purge(){
  var keep=[],gone=false;
  S.archive=S.archive||[];
  S.orders.forEach(function(o){
    if(o.status==='Picked up'&&o.completedAt&&diffDays(o.completedAt)<=-90){archiveOrder(o);gone=true;}
    else keep.push(o);
  });
  if(gone){S.orders=keep;save();}
}
function ledger(){
  var e=(S.archive||[]).slice();
  S.orders.forEach(function(o){
    e.push({d:o.date,i:o.deposit,o:expenses(o),n:1});
    o.adds.forEach(function(m){e.push({d:m.date,i:m.amt,o:0,n:0});});
  });
  (S.expenses||[]).forEach(function(x){e.push({d:x.date,i:0,o:x.amt,n:0});});
  return e;
}
function weekStart(s){var d=parse(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d);}
function series(kind){
  var f=kind==='day'?function(s){return s;}:kind==='week'?weekStart:function(s){return s.slice(0,7);};
  var m={};
  ledger().forEach(function(e){var k=f(e.d),b=m[k]||(m[k]={i:0,o:0,n:0});b.i+=e.i;b.o+=e.o;b.n+=e.n;});
  var out=[],N=kind==='day'?30:12,now=new Date(),ws=weekStart(todayIso()),i,k,lab,b,d;
  for(i=N-1;i>=0;i--){
    if(kind==='day'){k=addDays(-i);lab=parse(k).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}
    else if(kind==='week'){k=addDays(-7*i,ws);lab=parse(k).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}
    else{d=new Date(now.getFullYear(),now.getMonth()-i,1);k=d.getFullYear()+'-'+pad(d.getMonth()+1);lab=MONTHS[d.getMonth()].slice(0,3)+' '+String(d.getFullYear()).slice(2);}
    b=m[k]||{i:0,o:0,n:0};
    out.push({k:k,lab:lab,i:b.i,o:b.o,n:b.n,p:b.i-b.o});
  }
  return out;
}
function fmtK(v){var a=Math.abs(v);return a>=1e6?(Math.round(v/1e5)/10)+'M':a>=1000?(Math.round(v/100)/10)+'k':String(Math.round(v));}
function lineChart(labels,lines,opt){
  opt=opt||{};
  var W=640,H=230,L=46,R=14,T=14,B=30,n=labels.length,all=[],i;
  lines.forEach(function(l){all=all.concat(l.values);});
  var mn=Math.min.apply(null,all.concat([0])),mx=Math.max.apply(null,all.concat([0])),ticks=4;
  if(opt.int){mx=Math.max(1,Math.ceil(mx));ticks=Math.min(4,mx);mx=Math.ceil(mx/ticks)*ticks;}
  if(mx===mn)mx=mn+1;
  var X=function(j){return L+(n>1?j*(W-L-R)/(n-1):(W-L-R)/2);},Y=function(v){return T+(mx-v)/(mx-mn)*(H-T-B);};
  var s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" role="img" aria-label="'+esc(opt.label||'Chart')+'">';
  for(var g=0;g<=ticks;g++){
    var v=mn+(mx-mn)*g/ticks,y=Y(v);
    s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)" stroke-width="1"/><text x="'+(L-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+fmtK(v)+'</text>';
  }
  if(mn<0)s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(0)+'" y2="'+Y(0)+'" stroke="var(--muted)" stroke-width="1.2"/>';
  var step=Math.ceil(n/6);
  for(i=0;i<n;i+=step)s+='<text x="'+X(i)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="var(--muted)">'+esc(labels[i])+'</text>';
  lines.forEach(function(l){
    var pts=l.values.map(function(v,j){return X(j).toFixed(1)+','+Y(v).toFixed(1);}).join(' ');
    s+='<polyline points="'+pts+'" fill="none" stroke="'+l.color+'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    l.values.forEach(function(v,j){s+='<circle cx="'+X(j).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="3" fill="'+l.color+'"><title>'+esc(labels[j]+' - '+l.name+': '+(opt.int?v:kes(v)))+'</title></circle>';});
  });
  s+='</svg><div class="legend">'+lines.map(function(l){return '<span><i style="background:'+l.color+'"></i>'+esc(l.name)+'</span>';}).join('')+'</div>';
  return s;
}

/* ---------- Track Orders page ---------- */
function ttable(title,hint,list,kind){
  var h='<h3>'+title+' ('+list.length+')</h3>';
  if(!list.length)return h+'<div class="panel"><div class="empty">'+hint+'</div></div>';
  h+='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Order</th><th>Client</th><th>Outfit</th><th>'+(kind==='done'?'Collected':'Pick-up')+'</th><th>Balance</th><th>'+(kind==='done'?'Deleted in':'Stage')+'</th><th></th></tr></thead><tbody>';
  list.forEach(function(o){
    var b=balance(o),pl=pickLabel(o),last=kind==='done'?'<span class="pill">'+Math.max(0,90+diffDays(o.completedAt))+' days</span>':'<span class="pill gold">'+esc(o.status)+'</span>';
    h+='<tr><td><span class="pill no">'+esc(o.no)+'</span></td><td>'+esc(o.client)+'</td><td>'+esc(o.outfit)+'</td><td>'+(kind==='done'?fmtDate(o.completedAt):fmtDate(o.pickup)+(pl.c==='bad'?' <span class="pill bad">'+esc(pl.t)+'</span>':''))+'</td><td class="money" style="color:'+(b>0?'var(--warn)':'var(--good)')+'">'+(b>0?kes(b):'Paid')+'</td><td>'+last+'</td><td><button class="btn primary sm" data-act="viewOrder" data-id="'+o.id+'">View</button></td></tr>';
  });
  return h+'</tbody></table></div>';
}
function track(){
  var byPick=function(a,b){return (a.pickup||'9')<(b.pickup||'9')?-1:1;};
  var pend=S.orders.filter(function(o){return o.status==='New';}).sort(byPick);
  var ong=S.orders.filter(function(o){return active(o)&&o.status!=='New';}).sort(byPick);
  var done=S.orders.filter(function(o){return !active(o);}).sort(function(a,b){return (b.completedAt||'')<(a.completedAt||'')?-1:1;});
  var h='<h2>Track orders</h2><p class="sub">Pending is not started yet. Ongoing is being made (cutting, sewing, fitting, ready). Completed is picked up, and is deleted after 90 days. Your revenue history is kept.</p>';
  return h+ttable('Pending orders','No pending orders.',pend,'pend')+ttable('Ongoing orders','Nothing is being made right now.',ong,'ong')+ttable('Completed orders','No completed orders yet.',done,'done');
}

/* ---------- Revenue page ---------- */
function pk(label,x){
  return '<div class="kpi"><b style="color:'+(x.p<0?'var(--bad)':'var(--good)')+'">'+kes(x.p)+'</b><small>'+label+'</small><br><small>In '+kes(x.i)+' · Used '+kes(x.o)+'</small></div>';
}
function revenue(){
  var ti=0,to=0;ledger().forEach(function(e){ti+=e.i;to+=e.o;});
  var d=series('day'),w=series('week'),mo=series('month'),cur=revPeriod==='day'?d:revPeriod==='week'?w:mo;
  var names={day:'Daily',week:'Weekly',month:'Monthly'},first={day:'Day',week:'Week starting',month:'Month'};
  var h='<div class="row"><div><h2>Revenue</h2><p class="sub">Money in is payments received. Money used is material, tailor pay, miscellaneous and other expenses.</p></div><button class="btn primary" data-act="addExpense">Add expense</button></div>';
  h+='<div class="kpis wide"><div class="kpi"><b>'+kes(ti)+'</b><small>Money in</small></div><div class="kpi"><b>'+kes(to)+'</b><small>Money used</small></div><div class="kpi"><b style="color:'+(ti-to<0?'var(--bad)':'var(--good)')+'">'+kes(ti-to)+'</b><small>Last net profit</small></div></div>';
  h+='<h3>Net profit</h3><div class="kpis wide">'+pk('Today',d[d.length-1])+pk('This week',w[w.length-1])+pk('This month',mo[mo.length-1])+'</div>';
  h+='<h3>Trends</h3><div class="filters">';
  ['day','week','month'].forEach(function(p){h+='<button data-rev="'+p+'" aria-pressed="'+(p===revPeriod)+'">'+names[p]+'</button>';});
  h+='</div><div class="panel" style="padding:12px 14px"><b>Orders placed</b>'+lineChart(cur.map(function(x){return x.lab;}),[{name:'Orders',color:'var(--accent)',values:cur.map(function(x){return x.n;})}],{int:true,label:'Orders placed'})+'</div>';
  h+='<div class="panel" style="padding:12px 14px;margin-top:12px"><b>Money in, money used and net profit (KES)</b>'+lineChart(cur.map(function(x){return x.lab;}),[{name:'Money in',color:'var(--accent)',values:cur.map(function(x){return x.i;})},{name:'Money used',color:'var(--bad)',values:cur.map(function(x){return x.o;})},{name:'Net profit',color:'var(--gold)',values:cur.map(function(x){return x.p;})}],{label:'Money in, money used and net profit'})+'</div>';
  h+='<h3>'+names[revPeriod]+' net profit, latest periods</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>'+first[revPeriod]+'</th><th>Orders</th><th>Money in</th><th>Money used</th><th>Net profit</th></tr></thead><tbody>';
  cur.slice(-8).reverse().forEach(function(x){h+='<tr><td>'+esc(x.lab)+'</td><td>'+x.n+'</td><td class="money">'+kes(x.i)+'</td><td class="money">'+kes(x.o)+'</td><td class="money" style="color:'+(x.p<0?'var(--bad)':'var(--good)')+'">'+kes(x.p)+'</td></tr>';});
  h+='</tbody></table></div><h3>Other expenses you added</h3><div class="panel">';
  var ex=(S.expenses||[]).slice().sort(function(a,b){return b.date<a.date?-1:1;});
  h+=ex.length?ex.map(function(x){return '<div class="item"><div class="main"><div class="t">'+kes(x.amt)+'</div><div class="m">'+fmtDate(x.date)+(x.note?' · '+esc(x.note):'')+'</div></div><button class="btn sm danger" data-act="delExp" data-id="'+x.id+'">Remove</button></div>';}).join(''):'<div class="empty">No other expenses. Add things like rent, thread or transport.</div>';
  return h+'</div>';
}

/* ---------- WhatsApp message to the client ---------- */
function waNum(p){
  var d=String(p||'').replace(/\D/g,'');
  if(!d)return '';
  if(d.indexOf('254')===0)return d;
  if(d.charAt(0)==='0')return '254'+d.slice(1);
  if(d.length===9)return '254'+d;
  return d;
}
function waText(o,kind,amt){
  var b=balance(o),L=[],bal=b>0?kes(b):'Fully paid, thank you';
  if(kind==='pay'){
    L.push('Hello '+o.client+', we have received your payment of '+kes(amt)+' for order '+o.no+'. Thank you!');
    L.push('');L.push('Total cost: '+kes(o.total));L.push('Paid so far: '+kes(received(o)));L.push('New balance: '+bal);
    if(o.pickup)L.push('Picking date: '+fmtFull(o.pickup));
  }else{
    L.push(kind==='new'?'Hello '+o.client+', thank you for choosing Graced Fashion and Glamour. Here are your order details.':'Hello '+o.client+', here are the latest details of your order.');
    L.push('');L.push('Order no: '+o.no);
    if(o.outfit)L.push('Outfit: '+o.outfit);
    L.push('Order date: '+fmtFull(o.date));
    if(o.fit1)L.push('Fitting date 1: '+fmtFull(o.fit1));
    if(o.fit2)L.push('Fitting date 2: '+fmtFull(o.fit2));
    L.push('Picking date: '+fmtFull(o.pickup));
    L.push('Total cost: '+kes(o.total));L.push('Paid so far: '+kes(received(o)));L.push('Balance: '+bal);
  }
  L.push('');L.push('Graced Fashion and Glamour');L.push(BIZ_PHONE);
  return L.join('\n');
}
function waModal(o,kind,amt){
  var txt=waText(o,kind,amt),n=waNum(o.phone);
  var h='<h2>WhatsApp message</h2><p class="sub">To '+esc(o.client)+(o.phone?' ('+esc(o.phone)+')':'')+'</p>';
  h+='<div class="panel" style="white-space:pre-wrap;padding:12px 14px;font-size:14px;overflow-wrap:anywhere">'+esc(txt)+'</div>';
  h+='<p class="sub" style="margin-top:10px">'+(n?'This opens WhatsApp with the message ready. Use the WhatsApp that is logged in to '+BIZ_PHONE+' and tap Send.':'This client has no phone number. Edit the order to add one.')+'</p>';
  h+='<div class="actions"><button class="btn" id="mc">Close</button><button class="btn" data-act="viewOrder" data-id="'+o.id+'">Back to order</button>'+(n?'<a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/'+n+'?text='+encodeURIComponent(txt)+'">Open WhatsApp</a>':'')+'</div>';
  showModal(h,'WhatsApp message');
  document.getElementById('mc').onclick=cancelForm;
}

/* ---------- Google Calendar sync (gracednjoki94l@gmail.com) ---------- */
function loadGsi(cb){
  if(window.google&&google.accounts&&google.accounts.oauth2){cb();return;}
  if(gsiCbs){gsiCbs.push(cb);return;}
  gsiCbs=[cb];
  var s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;
  s.onload=function(){var l=gsiCbs;gsiCbs=null;l.forEach(function(f){f();});};
  s.onerror=function(){gsiCbs=null;toast('Could not load Google sign-in. Check your internet connection.');};
  document.head.appendChild(s);
}
function ensureToken(cb){
  if(!S.gClientId){toast('Set up Google Calendar sync first, in the Calendar tab.');return;}
  if(G.token&&Date.now()<G.exp-30000){cb();return;}
  loadGsi(function(){
    if(!G.client){
      G.client=google.accounts.oauth2.initTokenClient({client_id:S.gClientId,scope:SCOPE,login_hint:CAL_ID,
        callback:function(r){
          if(r&&r.access_token){G.token=r.access_token;G.exp=Date.now()+(+r.expires_in||3600)*1000;S.gConnected=true;save();var f=G.next;G.next=null;if(f)f();}
          else toast('Google sign-in did not complete.');
        },
        error_callback:function(){G.next=null;toast('Google sign-in was closed or blocked. Allow pop-ups and try again.');}});
    }
    G.next=cb;G.client.requestAccessToken({prompt:S.gConnected?'':'consent'});
  });
}
function gReq(method,id,body){
  var url='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(CAL_ID)+'/events'+(id?'/'+encodeURIComponent(id):'');
  return fetch(url,{method:method,headers:{Authorization:'Bearer '+G.token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}).then(function(r){
    if(r.status===204)return {ok:true,status:204};
    return r.json().then(function(j){return {ok:r.ok,status:r.status,json:j};});
  });
}
function chk(r){if(!r.ok)throw new Error((r.json&&r.json.error&&r.json.error.message)||('HTTP '+r.status));}
function eventBody(o,key){
  var base=o.no+' '+o.client+(o.outfit?' ('+o.outfit+')':''),tail='Tailor: '+(o.tailor||'not assigned')+'.',s=null,e=null,t='',d='';
  if(key==='making'&&active(o)&&o.pickup&&o.date<o.pickup){s=o.date;e=o.pickup;t='Being made: '+base;d='Being made. Pick-up is '+fmtFull(o.pickup)+'. '+tail;}
  else if(key==='fit1'&&o.fit1){s=o.fit1;e=addDays(1,o.fit1);t='Fitting 1: '+base;d='Fitting for '+o.client+'. '+tail+(o.phone?' Phone: '+o.phone+'.':'');}
  else if(key==='fit2'&&o.fit2){s=o.fit2;e=addDays(1,o.fit2);t='Fitting 2: '+base;d='Second fitting for '+o.client+'. '+tail+(o.phone?' Phone: '+o.phone+'.':'');}
  else if(key==='pick'&&o.pickup){s=o.pickup;e=addDays(1,o.pickup);t='Pick-up: '+base;d=o.client+' collects. Balance due: '+kes(balance(o))+'.'+(o.phone?' Phone: '+o.phone+'.':'');}
  if(!s)return null;
  return {summary:t,description:d,start:{date:s},end:{date:e}};
}
function syncOrder(o0){
  return ['making','fit1','fit2','pick'].reduce(function(p,k){
    return p.then(function(){
      var o=byId(o0.id);if(!o)return;
      o.gcal=o.gcal||{};
      var body=eventBody(o,k),id=o.gcal[k];
      if(body&&id)return gReq('PATCH',id,body).then(function(r){
        if(r.status===404||r.status===410){delete o.gcal[k];return gReq('POST','',body).then(function(r2){chk(r2);o.gcal[k]=r2.json.id;});}
        chk(r);
      });
      if(body)return gReq('POST','',body).then(function(r){chk(r);o.gcal[k]=r.json.id;});
      if(id)return gReq('DELETE',id).then(function(){delete o.gcal[k];});
    });
  },Promise.resolve()).then(function(){var o=byId(o0.id);if(o)o.gdirty=false;});
}
function syncAll(){
  if(G.busy)return;
  ensureToken(function(){
    var list=S.orders.filter(function(o){return o.gdirty;});
    if(!list.length){toast('Google Calendar is already up to date.');return;}
    G.busy=true;toast('Adding to Google Calendar...');
    list.reduce(function(p,o){return p.then(function(){return syncOrder(o);});},Promise.resolve())
      .then(function(){toast('Done. '+list.length+' order'+(list.length>1?'s':'')+' synced to '+CAL_ID+'.');})
      .catch(function(err){toast('Calendar sync failed: '+err.message);})
      .then(function(){G.busy=false;save();render();});
  });
}
function gAuto(){if(S.gClientId&&S.gConnected)syncAll();}
function syncNow(){
  if(S.sample){toast('Clear the example orders first, then sync.');return;}
  S.orders.forEach(function(o){o.gdirty=true;});save();syncAll();
}
function deleteEvents(o){
  var ids=Object.keys(o.gcal||{}).map(function(k){return o.gcal[k];});
  if(!ids.length||!S.gClientId||!S.gConnected)return;
  ensureToken(function(){
    ids.reduce(function(p,id){return p.then(function(){return gReq('DELETE',id);});},Promise.resolve())
      .then(function(){toast('Removed from Google Calendar.');})
      .catch(function(){toast('Could not remove the calendar events.');});
  });
}
function gSetup(){
  openForm('Google Calendar sync',[{id:'cid',label:'Google OAuth client ID',value:S.gClientId||'',req:true}],function(v){
    S.gClientId=v.cid.trim();S.gConnected=false;G.client=null;G.token=null;loadGsi(function(){});
  },'Save','<p class="sub">One-time setup: in Google Cloud Console create an OAuth client ID of type Web application, turn on the Google Calendar API, add the address where this app is hosted as an authorised JavaScript origin, then paste the client ID here. When Google asks you to sign in, use <b>'+CAL_ID+'</b>.</p>');
}
function gcalPanel(){
  var st=!S.gClientId?'not set up yet':S.gConnected?'connected':'set up, not signed in yet';
  return '<h3>Google Calendar sync</h3><div class="note" style="display:block"><p style="margin:0 0 8px">Fittings, pick-up days and making days are added to the calendar of <b>'+CAL_ID+'</b> when you save an order. Status: <b>'+st+'</b>.</p><div class="links">'+(S.gClientId?'<button class="btn primary sm" data-act="gSync">Sign in and sync all orders</button>':'')+'<button class="btn sm" data-act="gSetup">'+(S.gClientId?'Change client ID':'Set up sync')+'</button></div></div>';
}

/* ---------- views ---------- */
function orderRow(o){
  var pl=pickLabel(o),b=balance(o);
  return '<div class="item"><div class="main"><div class="t"><span class="pill no">'+esc(o.no)+'</span> '+esc(o.client)+'</div><div class="m">'+esc(o.outfit)+' · Tailor: '+esc(o.tailor||'not assigned')+'</div><div class="m">Total '+kes(o.total)+' · Balance <span class="money" style="color:'+(b>0?'var(--warn)':'var(--good)')+'">'+(b>0?kes(b):'Paid in full')+'</span></div></div><div class="side"><span class="pill '+pl.c+'">'+esc(pl.t)+'</span><span class="pill gold">'+esc(o.status)+'</span><button class="btn primary sm" data-act="viewOrder" data-id="'+o.id+'">View</button></div></div>';
}
function dash(){
  var act=S.orders.filter(active);
  var inWeek=function(d){return d&&diffDays(d)>=0&&diffDays(d)<=7;};
  var fits=S.orders.filter(active).reduce(function(a,o){return a+(inWeek(o.fit1)?1:0)+(inWeek(o.fit2)?1:0);},0);
  var picks=act.filter(function(o){return inWeek(o.pickup);}).length;
  var recv=S.orders.reduce(function(a,o){return a+received(o);},0),owed=S.orders.reduce(function(a,o){return a+balance(o);},0),exp=S.orders.reduce(function(a,o){return a+expenses(o);},0);
  var h='';
  if(S.sample)h+='<div class="note"><span>Showing example orders so you can see how it works.</span><button class="btn sm" data-act="clearSample">Clear examples and start fresh</button></div>';
  h+='<h2>Dashboard</h2><p class="sub">Orders in progress, what is due this week, and the money.</p>';
  h+='<div class="kpis"><div class="kpi"><b>'+act.length+'</b><small>Orders in progress</small></div><div class="kpi"><b>'+fits+'</b><small>Fittings this week</small></div><div class="kpi"><b>'+picks+'</b><small>Pick-ups this week</small></div><div class="kpi"><b>'+kes(owed).replace('KES ','')+'</b><small>Balances owed (KES)</small></div><div class="kpi"><b>'+kes(recv-exp).replace('KES ','')+'</b><small>Received minus costs (KES)</small></div></div>';
  h+='<div class="grid2"><div><h3>Being made this week</h3><div class="panel">';
  var mk=act.filter(function(o){return o.status!=='Ready'&&(!o.pickup||diffDays(o.pickup)>=-2);}).sort(function(a,b){return (a.pickup||'9')<(b.pickup||'9')?-1:1;});
  h+=mk.length?mk.map(function(o){var pl=pickLabel(o);return '<div class="item"><div class="main"><div class="t"><span class="pill no">'+esc(o.no)+'</span> '+esc(o.client)+'</div><div class="m">'+esc(o.outfit)+' · '+esc(o.tailor||'no tailor yet')+'</div></div><div class="side"><span class="pill gold">'+esc(o.status)+'</span><span class="pill '+pl.c+'">'+esc(pl.t)+'</span></div></div>';}).join(''):'<div class="empty">No clothes in the making right now.</div>';
  h+='</div></div><div><h3>Fittings and pick-ups, next 7 days</h3><div class="panel">';
  var list=[];for(var i=0;i<=7;i++){var k=addDays(i);eventsOn(k).forEach(function(e){if(active(e.o))list.push({k:k,e:e});});}
  h+=list.length?list.map(function(x){return '<div class="item"><div class="main"><div class="t">'+x.e.label+': '+esc(x.e.o.client)+'</div><div class="m">'+esc(x.e.o.no)+' · '+esc(x.e.o.outfit)+'</div></div><div class="side"><span class="pill '+(x.e.kind==='pick'?'':'gold')+'">'+(diffDays(x.k)===0?'Today':fmtDate(x.k))+'</span></div></div>';}).join(''):'<div class="empty">No fittings or pick-ups in the next 7 days.</div>';
  h+='</div><h3>Balances to collect</h3><div class="panel">';
  var due=S.orders.filter(function(o){return balance(o)>0;}).sort(function(a,b){return balance(b)-balance(a);}).slice(0,4);
  h+=due.length?due.map(function(o){return '<div class="item"><div class="main"><div class="t">'+esc(o.client)+'</div><div class="m">'+esc(o.no)+'</div></div><span class="pill warn">'+kes(balance(o))+'</span></div>';}).join(''):'<div class="empty">No balances outstanding.</div>';
  return h+'</div></div></div>';
}
function orders(){
  var q=orderQ.toLowerCase();
  var list=S.orders.filter(function(o){
    var okF=orderFilter==='All'||(orderFilter==='Active'?active(o):o.status===orderFilter);
    return okF&&(!q||(o.no+' '+o.client+' '+o.outfit).toLowerCase().indexOf(q)>-1);
  }).sort(function(a,b){return b.seq-a.seq;});
  var h='<div class="row"><div><h2>Orders</h2><p class="sub">Next order number: <b>GFG-'+pad(S.nextSeq)+'</b></p></div><div class="links"><button class="btn" data-act="tailors">Tailors</button><button class="btn primary" data-act="newOrder">New order</button></div></div><div class="filters">';
  ['Active'].concat(STATUSES,['All']).forEach(function(f){h+='<button data-filter="'+f+'" aria-pressed="'+(f===orderFilter)+'">'+f+'</button>';});
  h+='</div><div class="controls"><div class="field"><label for="oq">Search</label><input id="oq" type="search" placeholder="Order number, client or outfit" value="'+esc(orderQ)+'"></div></div>';
  h+='<div class="panel">'+(list.length?list.map(orderRow).join(''):'<div class="empty">No orders here. Tap New order to add one.</div>')+'</div>';
  return h;
}
function calendar(){
  var y=calMonth.getFullYear(),m=calMonth.getMonth(),first=new Date(y,m,1),start=new Date(y,m,1-((first.getDay()+6)%7)),t=todayIso();
  var h='<h2>Calendar</h2><p class="sub">Fittings and pick-up days. Shaded days have clothes being made.</p>';
  h+='<div class="row" style="margin-bottom:10px;align-items:center"><button class="btn" data-act="prevMonth" aria-label="Previous month">&larr;</button><b style="font-family:var(--display);font-size:22px">'+MONTHS[m]+' '+y+'</b><button class="btn" data-act="nextMonth" aria-label="Next month">&rarr;</button></div><div class="cal">';
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(function(d){h+='<div class="dow">'+d+'</div>';});
  for(var i=0;i<42;i++){
    var d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i),k=iso(d),dots='';
    eventsOn(k).forEach(function(e){if(!active(e.o))return;dots+='<span class="dot '+(e.kind==='pick'?(k<t?'late':'pick'):'fit')+'"></span>';});
    h+='<button class="day'+(d.getMonth()!==m?' out':'')+(k===t?' today':'')+(making(k).length?' making':'')+'" data-day="'+k+'" aria-pressed="'+(k===calSel)+'"><span>'+d.getDate()+'</span><span class="dots">'+dots+'</span></button>';
  }
  h+='</div><div class="legend"><span><i style="background:var(--gold)"></i>Fitting</span><span><i style="background:var(--accent)"></i>Pick-up</span><span><i style="background:var(--bad)"></i>Overdue pick-up</span></div>';
  var ev=eventsOn(calSel),mk=making(calSel);
  h+='<h3>'+fmtDate(calSel)+'</h3><div class="panel">';
  h+=ev.map(function(e){return '<div class="item"><div class="main"><div class="t">'+e.label+': '+esc(e.o.client)+'</div><div class="m">'+esc(e.o.no)+' · '+esc(e.o.outfit)+(e.kind==='pick'?' · Balance '+kes(balance(e.o)):'')+'</div></div><div class="side"><span class="pill '+(e.kind==='pick'?'':'gold')+'">'+e.label+'</span><button class="btn primary sm" data-act="viewOrder" data-id="'+e.o.id+'">View</button></div></div>';}).join('');
  h+=mk.map(function(o){return '<div class="item"><div class="main"><div class="t">Being made: '+esc(o.client)+'</div><div class="m">'+esc(o.no)+' · '+esc(o.outfit)+' · '+esc(o.tailor||'no tailor yet')+'</div></div><div class="side"><span class="pill">'+esc(o.status)+'</span><button class="btn sm" data-act="viewOrder" data-id="'+o.id+'">View</button></div></div>';}).join('');
  if(!ev.length&&!mk.length)h+='<div class="empty">Nothing scheduled for this day.</div>';
  h+='</div>'+gcalPanel()+'<h3>Phone reminders</h3><div class="note" style="display:block"><p style="margin:0 0 6px">Open any order and use its calendar buttons. They open Google Calendar with the event filled in, so you only tap Save. "Daily making reminders" creates one event for every day the clothes are being made, up to the day before pick-up.</p><p style="margin:0">Your phone then reminds you with its normal calendar alerts. Set the alert time you like in the calendar app.</p></div>';
  return h;
}

function render(){
  document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('nav').innerHTML=TABS.map(function(t){return '<button data-tab="'+t[0]+'" aria-current="'+(t[0]===tab)+'">'+t[1]+'</button>';}).join('');
  var q=document.activeElement&&document.activeElement.id==='oq';
  purge();
  document.getElementById('view').innerHTML=({dash:dash,orders:orders,track:track,rev:revenue,cal:calendar})[tab]();
  if(q){var el=document.getElementById('oq');el.focus();el.setSelectionRange(el.value.length,el.value.length);}
}

/* ---------- modals ---------- */
function showModal(html,label){
  document.getElementById('modalRoot').innerHTML='<div class="overlay" id="ov"><div class="modal" role="dialog" aria-label="'+esc(label)+'">'+html+'</div></div>';
  document.getElementById('ov').addEventListener('mousedown',function(e){if(e.target.id==='ov')cancelForm();});
}
function closeForm(){document.getElementById('modalRoot').innerHTML='';}
function cancelForm(){pendingView=null;pendingWA=null;closeForm();}
function fld(f){
  if(f.type==='heading')return '<h3>'+esc(f.label)+'</h3>';
  var v=f.value==null?'':f.value,h='<div class="field"><label for="f_'+f.id+'">'+esc(f.label)+'</label>';
  if(f.options)h+='<select id="f_'+f.id+'">'+f.options.map(function(o){return '<option value="'+esc(o)+'"'+(o===v?' selected':'')+'>'+esc(o)+'</option>';}).join('')+'</select>';
  else if(f.type==='textarea')h+='<textarea id="f_'+f.id+'" rows="2">'+esc(v)+'</textarea>';
  else h+='<input id="f_'+f.id+'" type="'+(f.type||'text')+'" value="'+esc(v)+'"'+(f.req?' required':'')+(f.readonly?' readonly tabindex="-1"':'')+(f.type==='number'?' min="0" step="any" inputmode="decimal"':'')+'>';
  return h+'</div>';
}
function openForm(title,fields,onSave,saveLabel,intro){
  var h='<form id="mf"><h2>'+esc(title)+'</h2>'+(intro||''),i=0;
  while(i<fields.length){var f=fields[i];if(f.half&&fields[i+1]&&fields[i+1].half){h+='<div class="two">'+fld(f)+fld(fields[i+1])+'</div>';i+=2;}else{h+=fld(f);i++;}}
  h+='<div class="actions"><button type="button" class="btn" id="mc">Cancel</button><button type="submit" class="btn primary">'+(saveLabel||'Save')+'</button></div></form>';
  showModal(h,title);
  document.getElementById('mc').onclick=cancelForm;
  document.getElementById('mf').onsubmit=function(e){
    e.preventDefault();var vals={};
    fields.forEach(function(f){if(f.type!=='heading')vals[f.id]=document.getElementById('f_'+f.id).value;});
    onSave(vals);save();closeForm();render();
    if(pendingWA){var w=pendingWA;pendingWA=null;pendingView=null;var wo=byId(w.id);if(wo)waModal(wo,w.kind,w.amt);}
    else if(pendingView){var p=pendingView;pendingView=null;var o=byId(p);if(o)viewOrder(o);}
  };
  var first=document.getElementById('mf').querySelector('input,select');if(first)first.focus();
}
function tailorOpts(cur){var l=['Not assigned'].concat(S.tailors);if(cur&&l.indexOf(cur)<0)l.push(cur);return l;}

function orderForm(o){
  var isNew=!o;
  o=o||{no:'GFG-'+pad(S.nextSeq),client:'',phone:'',outfit:'',total:'',date:todayIso(),pickup:'',fit1:'',fit2:'',tailor:'Not assigned',deposit:'',material:'',tailorPay:'',misc:'',notes:''};
  var intro='<p class="sub">Order <b>'+esc(o.no)+'</b> · Order date '+fmtFull(o.date)+(isNew?' (set automatically)':'')+'</p>';
  openForm(isNew?'New order':'Edit '+o.no,[
    {id:'client',label:'Name of client',value:o.client,req:true},
    {id:'phone',label:'Phone number',type:'tel',value:o.phone,half:true},
    {id:'outfit',label:'Outfit being made',value:o.outfit,half:true},
    {type:'heading',label:'Money from the client'},
    {id:'total',label:'Total cost (KES)',type:'number',value:o.total,req:true,half:true},
    {id:'deposit',label:'Deposit paid (KES)',type:'number',value:o.deposit,half:true},
    {type:'heading',label:'Dates'},
    {id:'pickup',label:'Picking date',type:'date',value:o.pickup,req:true},
    {id:'fit1',label:'Fitting date 1',type:'date',value:o.fit1,half:true},
    {id:'fit2',label:'Fitting date 2',type:'date',value:o.fit2,half:true},
    {type:'heading',label:'Production and costs'},
    {id:'tailor',label:'Tailor assigned to',options:tailorOpts(o.tailor),value:o.tailor},
    {id:'material',label:'Material cost (KES)',type:'number',value:o.material,half:true},
    {id:'tailorPay',label:'Tailor payment (KES)',type:'number',value:o.tailorPay,half:true},
    {id:'misc',label:'Miscellaneous (KES)',type:'number',value:o.misc},
    {id:'notes',label:'Notes and measurements',type:'textarea',value:o.notes}
  ],function(v){
    var rec={id:o.id||uid(),seq:o.seq||S.nextSeq,no:o.no,client:v.client.trim(),phone:v.phone,outfit:v.outfit,total:num(v.total),date:o.date,pickup:v.pickup,fit1:v.fit1,fit2:v.fit2,tailor:v.tailor==='Not assigned'?'':v.tailor,deposit:num(v.deposit),adds:o.adds||[],material:num(v.material),tailorPay:num(v.tailorPay),misc:num(v.misc),status:o.status||'New',notes:v.notes,completedAt:o.completedAt,gcal:o.gcal||{},gdirty:true};
    if(isNew){S.orders.push(rec);S.nextSeq++;if(S.sample&&S.orders.length===1)S.sample=false;}else S.orders=S.orders.map(function(x){return x.id===o.id?rec:x;});
    if(!isNew)pendingView=o.id;
    if(isNew)pendingWA={id:rec.id,kind:'new'};
    gAuto();
  },isNew?'Save order':'Save changes',intro);
  if(!isNew)pendingView=o.id;
}
function viewOrder(o){
  var pl=pickLabel(o),b=balance(o);
  var h='<div class="row" style="align-items:center"><h2 style="margin:0"><span class="pill no" style="font-size:15px">'+esc(o.no)+'</span> '+esc(o.client)+'</h2><span class="pill gold">'+esc(o.status)+'</span></div><p class="sub" style="margin-top:6px">'+esc(o.outfit||'Outfit not described')+(o.phone?' · '+esc(o.phone):'')+'</p>';
  h+='<h3>Dates</h3><dl><dt>Order date</dt><dd>'+fmtFull(o.date)+'</dd><dt>Picking date</dt><dd>'+fmtFull(o.pickup)+' <span class="pill '+pl.c+'">'+esc(pl.t)+'</span></dd><dt>Fitting 1</dt><dd>'+fmtFull(o.fit1)+'</dd><dt>Fitting 2</dt><dd>'+fmtFull(o.fit2)+'</dd><dt>Tailor assigned</dt><dd>'+esc(o.tailor||'Not assigned')+'</dd></dl>';
  h+='<h3>Money from the client</h3><dl><dt>Total cost</dt><dd>'+kes(o.total)+'</dd><dt>Deposit paid</dt><dd>'+kes(o.deposit)+'</dd><dt>Money added</dt><dd>'+kes(o.adds.reduce(function(a,m){return a+m.amt;},0))+'</dd><dt>Balance</dt><dd style="color:'+(b>0?'var(--warn)':'var(--good)')+'">'+(b>0?kes(b):'Paid in full')+'</dd></dl>';
  if(o.adds.length){h+='<div class="panel" style="margin-top:10px">'+o.adds.map(function(m){return '<div class="item" style="padding:8px 0"><div class="main"><div class="t">'+kes(m.amt)+'</div><div class="m">'+fmtDate(m.date)+(m.note?' · '+esc(m.note):'')+'</div></div><button class="btn sm danger" data-act="delAdd" data-id="'+o.id+'" data-aid="'+m.id+'">Remove</button></div>';}).join('')+'</div>';}
  h+='<h3>Costs</h3><dl><dt>Material cost</dt><dd>'+kes(o.material)+'</dd><dt>Tailor payment</dt><dd>'+kes(o.tailorPay)+'</dd><dt>Miscellaneous</dt><dd>'+kes(o.misc)+'</dd><dt>Total costs</dt><dd>'+kes(expenses(o))+'</dd><dt>Profit on this order</dt><dd style="color:'+(profit(o)<0?'var(--bad)':'var(--good)')+'">'+kes(profit(o))+'</dd></dl>';
  if(o.notes)h+='<h3>Notes</h3><p style="margin:0;font-size:14px;overflow-wrap:anywhere">'+esc(o.notes)+'</p>';
  h+='<h3>Add to phone calendar</h3>'+linkRow(o);
  var si=STATUSES.indexOf(o.status);
  h+='<div class="actions">'+(si<STATUSES.length-1?'<button class="btn primary" data-act="advance" data-id="'+o.id+'">Move to '+STATUSES[si+1]+'</button>':'')+'<button class="btn" data-act="addMoney" data-id="'+o.id+'">Add money</button><button class="btn" data-act="wa" data-id="'+o.id+'">WhatsApp client</button><button class="btn" data-act="editOrder" data-id="'+o.id+'">Edit</button><button class="btn danger" data-act="delOrder" data-id="'+o.id+'">Delete</button><button class="btn" id="mc">Close</button></div>';
  showModal(h,'Order '+o.no);document.getElementById('mc').onclick=cancelForm;
}

document.addEventListener('click',function(e){
  var el=e.target.closest('[data-tab],[data-act],[data-filter],[data-day],[data-rev]');if(!el)return;
  if(el.dataset.tab){tab=el.dataset.tab;render();return;}
  if(el.dataset.filter){orderFilter=el.dataset.filter;render();return;}
  if(el.dataset.rev){revPeriod=el.dataset.rev;render();return;}
  if(el.dataset.day){calSel=el.dataset.day;render();return;}
  var a=el.dataset.act,id=el.dataset.id,o=id?byId(id):null;
  if(a==='newOrder')orderForm();
  else if(a==='viewOrder')viewOrder(o);
  else if(a==='editOrder')orderForm(o);
  else if(a==='advance'){o.status=STATUSES[STATUSES.indexOf(o.status)+1];if(o.status==='Picked up')o.completedAt=todayIso();o.gdirty=true;save();render();viewOrder(o);gAuto();}
  else if(a==='addMoney'){pendingView=o.id;openForm('Add money: '+o.no,[{id:'amt',label:'Amount received (KES), balance '+balance(o),type:'number',value:balance(o)||'',req:true},{id:'date',label:'Date',type:'date',value:todayIso(),half:true},{id:'note',label:'Note',half:true}],function(v){var am=num(v.amt);o.adds.push({id:uid(),amt:am,date:v.date||todayIso(),note:v.note});o.gdirty=true;pendingWA={id:o.id,kind:'pay',amt:am};gAuto();},'Add money');}
  else if(a==='delAdd'){o.adds=o.adds.filter(function(m){return m.id!==el.dataset.aid;});save();render();viewOrder(o);}
  else if(a==='delOrder'){
    if(el.dataset.armed){deleteEvents(o);S.orders=S.orders.filter(function(x){return x.id!==id;});save();closeForm();render();}
    else{el.dataset.armed='1';el.textContent='Tap again to delete';}
  }
  else if(a==='tailors'){
    openForm('Tailors',[{id:'names',label:'One tailor name per line',type:'textarea',value:S.tailors.join('\n')}],function(v){S.tailors=v.names.split('\n').map(function(x){return x.trim();}).filter(Boolean);},'Save tailors');
    document.getElementById('f_names').rows=5;
  }
  else if(a==='wa')waModal(o,'update');
  else if(a==='gSetup')gSetup();
  else if(a==='gSync')syncNow();
  else if(a==='addExpense'){openForm('Add expense',[{id:'amt',label:'Amount (KES)',type:'number',req:true,half:true},{id:'date',label:'Date',type:'date',value:todayIso(),half:true},{id:'note',label:'What was it for (rent, thread, transport)'}],function(v){S.expenses.push({id:uid(),amt:num(v.amt),date:v.date||todayIso(),note:v.note});},'Add expense');}
  else if(a==='delExp'){S.expenses=S.expenses.filter(function(x){return x.id!==id;});save();render();}
  else if(a==='prevMonth'){calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()-1,1);render();}
  else if(a==='nextMonth'){calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+1,1);render();}
  else if(a==='clearSample'){S={orders:[],tailors:S.tailors,nextSeq:1,sample:false,expenses:[],archive:[],gClientId:S.gClientId,gConnected:S.gConnected};save();render();}
});
document.addEventListener('input',function(e){if(e.target.id==='oq'){orderQ=e.target.value;render();}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')cancelForm();});

/* ---------- start ---------- */
document.getElementById('logout').onclick=function(){closeForm();GFG_AUTH.logout();};
migrate();
if(S.gClientId)loadGsi(function(){});
render();
})();