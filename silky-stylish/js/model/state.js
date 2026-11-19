/* Silky Stylish / js/model/state.js
   The saved data (orders, tailors, settings), loading, saving and page state. */
'use strict';

var S=load(KEY);
if(!S||!S.orders)S=sample();
if(!S.archive)S.archive={};
if(!S.settings)S.settings={};
if(!S.settings.gRemoveNos)S.settings.gRemoveNos=[];
S.orders.forEach(function(o){if(o.status==='Picked up'&&!o.doneDate)o.doneDate=todayIso();});
function save(){store(KEY,S);}
var tab='dash',orderFilter='Active',orderQ='',calMonth=new Date(),calSel=todayIso(),pendingView=null,revGran='week';
calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth(),1);
function byId(id){return S.orders.filter(function(o){return o.id===id;})[0];}
