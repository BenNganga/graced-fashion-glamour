/* Silky Stylish / js/views/dashboard.js
   Dashboard page. */
'use strict';

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
