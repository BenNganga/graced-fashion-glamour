/* Silky Stylish / js/model/finance.js
   Money in, money used, net profit by day/week/month, and the 90-day clean-up of completed orders. */
'use strict';

/* Money in is counted on the day each payment was received (the deposit on the order date).
   Money used (material, tailor payment, miscellaneous) is counted on the order date. */
function archiveOrder(o){
  var A=S.archive;function day(k){return A[k]||(A[k]={inn:0,out:0,orders:0});}
  if(o.deposit>0)day(o.date).inn+=o.deposit;
  o.adds.forEach(function(m){day(m.date).inn+=m.amt;});
  day(o.date).out+=expenses(o);
  day(o.date).orders+=1;
}
/* Completed orders are removed 90 days after they were picked up. Their money stays in Revenue. */
function purgeOld(){
  var cut=addDays(-90),keep=[],changed=false;
  S.orders.forEach(function(o){
    if(o.status==='Picked up'&&o.doneDate&&o.doneDate<cut){archiveOrder(o);changed=true;}else keep.push(o);
  });
  if(changed){S.orders=keep;save();}
}
function dayMap(){
  var m={};function d(k){return m[k]||(m[k]={inn:0,out:0,orders:0});}
  Object.keys(S.archive).forEach(function(k){var a=S.archive[k],x=d(k);x.inn+=a.inn;x.out+=a.out;x.orders+=a.orders;});
  S.orders.forEach(function(o){
    var x=d(o.date);x.orders++;x.out+=expenses(o);x.inn+=o.deposit;
    o.adds.forEach(function(p){d(p.date).inn+=p.amt;});
  });
  return m;
}
function weekStart(k){var d=parse(k);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d);}
function bucketKey(k,g){return g==='day'?k:g==='week'?weekStart(k):k.slice(0,7);}
function periods(g){
  var dm=dayMap(),agg={};
  Object.keys(dm).forEach(function(k){var b=bucketKey(k,g),x=agg[b]||(agg[b]={inn:0,out:0,orders:0});x.inn+=dm[k].inn;x.out+=dm[k].out;x.orders+=dm[k].orders;});
  var n=g==='day'?14:g==='week'?10:12,list=[],now=new Date();
  for(var i=n-1;i>=0;i--){
    var key,label;
    if(g==='day'){key=addDays(-i);label=parse(key).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}
    else if(g==='week'){key=addDays(-7*i,weekStart(todayIso()));label=parse(key).toLocaleDateString('en-GB',{day:'numeric',month:'short'});}
    else{var d=new Date(now.getFullYear(),now.getMonth()-i,1);key=iso(d).slice(0,7);label=d.toLocaleDateString('en-GB',{month:'short',year:'2-digit'});}
    var x=agg[key]||{inn:0,out:0,orders:0};
    list.push({key:key,label:label,inn:x.inn,out:x.out,orders:x.orders,net:x.inn-x.out});
  }
  return list;
}
