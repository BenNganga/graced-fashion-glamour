/* Silky Stylish / js/model/orders.js
   Order maths: money received, balance, costs, profit, and the pick-up label. */
'use strict';

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
