/* Silky Stylish / js/model/sample.js
   The example orders shown on first use. Delete or edit freely; nothing else depends on it. */
'use strict';

function sample(){
  var T=['Grace Mwende','Joseph Kimani','Lydia Ouko'];
  var cur=[
    ['Amina Wanjiru','Wedding gown, ivory lace',48000,-30,5,-14,-3,'Grace Mwende',25000,12000,9000,9000,5000,'Sewing'],
    ['Mercy Achieng','Kitenge two-piece set',9500,-6,3,-1,1,'Joseph Kimani',5000,0,2200,2500,300,'Fitting'],
    ['Faith Njeri','Bridesmaid dresses x4',32000,-3,12,6,9,'Lydia Ouko',16000,0,11000,8000,500,'Cutting'],
    ['Linet Cheruiyot','Official trouser suit',14000,-20,-2,-12,-6,'Joseph Kimani',7000,7000,4000,3500,200,'Ready'],
    ['Wanjiku Kariuki','Church dress',7500,0,14,7,10,'',3000,0,1800,1500,100,'New']
  ].map(function(x,i){return {id:'o'+i,seq:i+11,no:'GFG-'+pad(i+11),client:x[0],phone:'07'+String(10000000+i*1379421).slice(0,8),outfit:x[1],total:x[2],date:addDays(x[3]),pickup:addDays(x[4]===5?x[4]+12:x[4]===3?x[4]+3:x[4]),fit1:addDays(x[5]+(i===0?7:0)),fit2:addDays(x[6]+(i===0?10:0)),tailor:x[7],deposit:x[8],adds:x[9]?[{id:'a'+i,amt:x[9],date:addDays(-5),note:'Second payment'}]:[],material:x[10],tailorPay:x[11],misc:x[12],status:x[13],doneDate:'',notes:''};});
  var seed=11;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280;}
  var names=['Rose Atieno','Nancy Wairimu','Diana Kerubo','Susan Mutheu','Joyce Akoth','Caroline Nduta','Beth Chepkemoi','Anne Wanjiku','Pauline Adhiambo','Esther Moraa'];
  var outfits=['Kitenge dress','Ladies suit','Bridesmaid dress','Evening gown','Wrap dress','Official dress','Two-piece set','Church dress','Maxi skirt set','Wedding guest gown'];
  var hist=names.map(function(nm,i){
    var ago=80-i*6,total=Math.round((6000+rnd()*22000)/500)*500;
    var mat=Math.round(total*(0.22+rnd()*0.12)/100)*100,tp=Math.round(total*(0.25+rnd()*0.1)/100)*100,misc=Math.round(rnd()*8)*100;
    var dep=Math.round(total*0.5/500)*500,pick=addDays(-(ago-16));
    return {id:'h'+i,seq:i+1,no:'GFG-'+pad(i+1),client:nm,phone:'07'+String(30000000+i*1111119).slice(0,8),outfit:outfits[i],total:total,date:addDays(-ago),pickup:pick,fit1:addDays(-ago+7),fit2:addDays(-ago+12),tailor:T[i%3],deposit:dep,adds:[{id:'ha'+i,amt:total-dep,date:pick,note:'Final payment'}],material:mat,tailorPay:tp,misc:misc,status:'Picked up',doneDate:pick,notes:''};
  });
  return {orders:hist.concat(cur),tailors:T,nextSeq:16,archive:{},settings:{},sample:true};
}
