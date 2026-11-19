/* Silky Stylish / js/views/revenue.js
   Revenue page: totals, net profit, breakdown table and charts. */
'use strict';

function revenue(){
  var dm=dayMap(),inn=0,out=0;
  Object.keys(dm).forEach(function(k){inn+=dm[k].inn;out+=dm[k].out;});
  var d=periods('day'),w=periods('week'),m=periods('month'),cur=({day:d,week:w,month:m})[revGran];
  var td=d[d.length-1],tw=w[w.length-1],tm=m[m.length-1];
  var col=function(v){return v<0?'var(--bad)':'var(--good)';};
  var h='<h2>Revenue</h2><p class="sub">Money in is what clients have paid. Money used is material, tailor payment and miscellaneous, counted on the day the order was made.</p>';
  h+='<div class="kpis"><div class="kpi"><b>'+kes(inn).replace('KES ','')+'</b><small>Money in, all time (KES)</small></div><div class="kpi"><b>'+kes(out).replace('KES ','')+'</b><small>Money used, all time (KES)</small></div><div class="kpi"><b style="color:'+col(inn-out)+'">'+kes(inn-out).replace('KES ','')+'</b><small>Net profit, all time (KES)</small></div></div>';
  h+='<h3>Net profit</h3><div class="kpis"><div class="kpi"><b style="color:'+col(td.net)+'">'+kes(td.net).replace('KES ','')+'</b><small>Today (KES)</small></div><div class="kpi"><b style="color:'+col(tw.net)+'">'+kes(tw.net).replace('KES ','')+'</b><small>This week, from Monday (KES)</small></div><div class="kpi"><b style="color:'+col(tm.net)+'">'+kes(tm.net).replace('KES ','')+'</b><small>This month (KES)</small></div></div>';
  h+='<h3>Breakdown</h3><div class="filters">'+[['day','Daily'],['week','Weekly'],['month','Monthly']].map(function(g){return '<button data-gran="'+g[0]+'" aria-pressed="'+(g[0]===revGran)+'">'+g[1]+'</button>';}).join('')+'</div>';
  h+='<div class="tblbox"><table style="min-width:520px"><thead><tr><th>'+(revGran==='week'?'Week starting':revGran==='day'?'Day':'Month')+'</th><th class="r">Orders</th><th class="r">Money in</th><th class="r">Money used</th><th class="r">Net profit</th></tr></thead><tbody>';
  h+=cur.slice().reverse().map(function(p){return '<tr><td>'+esc(p.label)+'</td><td class="r">'+p.orders+'</td><td class="r">'+kes(p.inn)+'</td><td class="r">'+kes(p.out)+'</td><td class="r" style="font-weight:700;color:'+col(p.net)+'">'+kes(p.net)+'</td></tr>';}).join('');
  h+='</tbody></table></div>';
  var span=revGran==='day'?'last 14 days':revGran==='week'?'last 10 weeks':'last 12 months';
  h+='<h3>Trends, '+span+'</h3><div class="stack"><div class="chartbox"><h4>Orders made</h4>'+lineChart(cur.map(function(p){return {label:p.label,v:p.orders};}),{label:'Orders made per period',money:false})+'</div><div class="chartbox"><h4>Net profit (KES)</h4>'+lineChart(cur.map(function(p){return {label:p.label,v:p.net};}),{label:'Net profit per period',money:true})+'</div></div>';
  return h;
}
