/* Silky Stylish / js/views/track.js
   Track orders page: pending, ongoing and completed tables and their move buttons. */
'use strict';

function trackActions(o,kind){
  var v='<button class="btn sm" data-act="viewOrder" data-id="'+o.id+'">View</button>';
  if(kind==='pend')return '<button class="btn primary sm" data-act="toOngoing" data-id="'+o.id+'">Move to ongoing</button>'+v;
  if(kind==='ongo')return '<button class="btn primary sm" data-act="toDone" data-id="'+o.id+'">Move to completed</button><button class="btn sm" data-act="backPending" data-id="'+o.id+'">Back to pending</button>'+v;
  return '<button class="btn sm" data-act="backOngoing" data-id="'+o.id+'">Back to ongoing</button>'+v;
}
function trackTable(title,note,list,kind){
  var h='<h3>'+esc(title)+' ('+list.length+')</h3><p class="sub" style="margin:-4px 0 8px">'+esc(note)+'</p><div class="tblbox"><table><thead><tr><th>Order</th><th>Client</th><th>Outfit</th><th>Tailor</th><th>Fittings</th><th>Pick-up</th><th class="r">Balance</th><th>'+(kind==='done'?'Completed':'Status')+'</th><th>Actions</th></tr></thead><tbody>';
  if(!list.length)return h+'<tr><td colspan="9" class="empty">No orders here.</td></tr></tbody></table></div>';
  h+=list.map(function(o){
    var b=balance(o),last=kind==='done'?fmtDate(o.doneDate)+' <span class="pill '+(90+diffDays(o.doneDate)<=7?'warn':'')+'">removed in '+Math.max(0,90+diffDays(o.doneDate))+'d</span>':'<span class="pill gold">'+esc(o.status)+'</span>';
    return '<tr><td><span class="pill no">'+esc(o.no)+'</span></td><td>'+esc(o.client)+'</td><td>'+esc(o.outfit)+'</td><td>'+esc(o.tailor||'Not assigned')+'</td><td>'+(o.fit1?fmtDate(o.fit1):'-')+(o.fit2?'<br>'+fmtDate(o.fit2):'')+'</td><td>'+fmtDate(o.pickup)+'</td><td class="r" style="color:'+(b>0?'var(--warn)':'var(--good)')+'">'+(b>0?kes(b):'Paid')+'</td><td>'+last+'</td><td><div class="links">'+trackActions(o,kind)+'</div></td></tr>';
  }).join('');
  return h+'</tbody></table></div>';
}
function track(){
  var byPick=function(a,b){return (a.pickup||'9')<(b.pickup||'9')?-1:1;};
  var pend=S.orders.filter(function(o){return o.status==='New';}).sort(byPick);
  var ongo=S.orders.filter(function(o){return ['Cutting','Sewing','Fitting','Ready'].indexOf(o.status)>-1;}).sort(byPick);
  var done=S.orders.filter(function(o){return o.status==='Picked up';}).sort(function(a,b){return (a.doneDate||'')<(b.doneDate||'')?1:-1;});
  var h='<h2>Track orders</h2><p class="sub">Where every order is, from not started to collected.</p>';
  h+=trackTable('Pending orders','Not started yet (status New).',pend,'pend');
  h+=trackTable('Ongoing orders','Being cut, sewn or fitted, or ready to collect.',ongo,'ongo');
  h+=trackTable('Completed orders','Picked up by the client. Each is removed 90 days after pick-up. Its money stays counted in Revenue.',done,'done');
  return h;
}
