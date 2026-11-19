/* Silky Stylish / js/views/calendar.js
   Calendar page: month grid, what is on each day. */
'use strict';

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
  h+='</div>'+gsyncPanel();
  return h;
}
