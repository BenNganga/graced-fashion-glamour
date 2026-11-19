/* Silky Stylish / js/sync/phone-links.js
   One-tap "Add to calendar" links that open Google Calendar for the account in config.js. */
'use strict';

function ymd(s){return s.replace(/-/g,'');}
function gcal(title,start,end,details,recurCount){
  var u='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(title)+'&dates='+ymd(start)+'/'+ymd(addDays(1,end||start))+'&details='+encodeURIComponent(details||'')+'&authuser='+encodeURIComponent(CAL_ACCOUNT);
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
