/* Silky Stylish / js/views/orders.js
   Orders page, the new/edit order form and the order sheet. */
'use strict';

function orderRow(o){
  var pl=pickLabel(o),b=balance(o);
  return '<div class="item"><div class="main"><div class="t"><span class="pill no">'+esc(o.no)+'</span> '+esc(o.client)+'</div><div class="m">'+esc(o.outfit)+' · Tailor: '+esc(o.tailor||'not assigned')+'</div><div class="m">Total '+kes(o.total)+' · Balance <span class="money" style="color:'+(b>0?'var(--warn)':'var(--good)')+'">'+(b>0?kes(b):'Paid in full')+'</span></div></div><div class="side"><span class="pill '+pl.c+'">'+esc(pl.t)+'</span><span class="pill gold">'+esc(o.status)+'</span><button class="btn primary sm" data-act="viewOrder" data-id="'+o.id+'">View</button></div></div>';
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
    var rec={id:o.id||uid(),seq:o.seq||S.nextSeq,no:o.no,client:v.client.trim(),phone:v.phone,outfit:v.outfit,total:num(v.total),date:o.date,pickup:v.pickup,fit1:v.fit1,fit2:v.fit2,tailor:v.tailor==='Not assigned'?'':v.tailor,deposit:num(v.deposit),adds:o.adds||[],material:num(v.material),tailorPay:num(v.tailorPay),misc:num(v.misc),status:o.status||'New',doneDate:o.doneDate||'',notes:v.notes};
    if(isNew){S.orders.push(rec);S.nextSeq++;if(S.sample&&S.orders.length===1)S.sample=false;}else S.orders=S.orders.map(function(x){return x.id===o.id?rec:x;});
    if(!isNew)pendingView=o.id;
    gSyncSoon(rec.id);
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
  h+='<div class="actions">'+(si<STATUSES.length-1?'<button class="btn primary" data-act="advance" data-id="'+o.id+'">Move to '+STATUSES[si+1]+'</button>':'')+'<button class="btn" data-act="addMoney" data-id="'+o.id+'">Add money</button><button class="btn" data-act="editOrder" data-id="'+o.id+'">Edit</button><button class="btn danger" data-act="delOrder" data-id="'+o.id+'">Delete</button><button class="btn" id="mc">Close</button></div>';
  showModal(h,'Order '+o.no);document.getElementById('mc').onclick=cancelForm;
}
