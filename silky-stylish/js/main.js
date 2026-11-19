/* Silky Stylish / js/main.js
   Starts the app: the login guard, button clicks and start-up. Loaded last. */
'use strict';

(function(){
if(!GFG_AUTH.require('silky-stylish'))return;
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-tab],[data-act],[data-filter],[data-day],[data-gran]');if(!el)return;
  if(el.dataset.tab){tab=el.dataset.tab;render();return;}
  if(el.dataset.filter){orderFilter=el.dataset.filter;render();return;}
  if(el.dataset.day){calSel=el.dataset.day;render();return;}
  if(el.dataset.gran){revGran=el.dataset.gran;render();return;}
  var a=el.dataset.act,id=el.dataset.id,o=id?byId(id):null;
  if(a==='newOrder')orderForm();
  else if(a==='viewOrder')viewOrder(o);
  else if(a==='editOrder')orderForm(o);
  else if(a==='advance'){o.status=STATUSES[STATUSES.indexOf(o.status)+1];if(o.status==='Picked up')o.doneDate=todayIso();save();render();viewOrder(o);gSyncSoon(o.id);}
  else if(a==='addMoney'){pendingView=o.id;openForm('Add money: '+o.no,[{id:'amt',label:'Amount received (KES), balance '+balance(o),type:'number',value:balance(o)||'',req:true},{id:'date',label:'Date',type:'date',value:todayIso(),half:true},{id:'note',label:'Note',half:true}],function(v){o.adds.push({id:uid(),amt:num(v.amt),date:v.date||todayIso(),note:v.note});gSyncSoon(o.id);},'Add money');}
  else if(a==='delAdd'){o.adds=o.adds.filter(function(m){return m.id!==el.dataset.aid;});save();render();viewOrder(o);}
  else if(a==='delOrder'){
    if(el.dataset.armed){gRemoveOrder(o);S.orders=S.orders.filter(function(x){return x.id!==id;});save();closeForm();render();}
    else{el.dataset.armed='1';el.textContent='Tap again to delete';}
  }
  else if(a==='tailors'){
    openForm('Tailors',[{id:'names',label:'One tailor name per line',type:'textarea',value:S.tailors.join('\n')}],function(v){S.tailors=v.names.split('\n').map(function(x){return x.trim();}).filter(Boolean);},'Save tailors');
    document.getElementById('f_names').rows=5;
  }
  else if(a==='prevMonth'){calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()-1,1);render();}
  else if(a==='nextMonth'){calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+1,1);render();}
  else if(a==='toOngoing'){o.status='Cutting';save();render();gSyncSoon(o.id);}
  else if(a==='toDone'){
    if(balance(o)>0&&!el.dataset.armed){el.dataset.armed='1';el.textContent='Balance '+kes(balance(o))+'. Tap again to complete';return;}
    o.status='Picked up';o.doneDate=todayIso();save();render();gSyncSoon(o.id);
  }
  else if(a==='backPending'){o.status='New';save();render();gSyncSoon(o.id);}
  else if(a==='backOngoing'){o.status='Ready';o.doneDate='';save();render();gSyncSoon(o.id);}
  else if(a==='gConnect')gConnect();
  else if(a==='gSyncAll')gSyncAll();
  else if(a==='gSettings')gSettings();
  else if(a==='clearSample'){S={orders:[],tailors:S.tailors,nextSeq:1,archive:{},settings:S.settings||{gRemoveNos:[]},sample:false};save();render();}
});
document.addEventListener('input',function(e){if(e.target.id==='oq'){orderQ=e.target.value;render();}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')cancelForm();});
purgeOld();
save();
document.getElementById('logout').onclick=function(){closeForm();GFG_AUTH.logout();};
render();
})();
