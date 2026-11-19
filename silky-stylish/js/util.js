/* Silky Stylish / js/util.js
   Small helpers: dates, money (KES), safe text, saving to the browser. No business rules here. */
'use strict';

function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parse(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function todayIso(){return iso(new Date());}
function addDays(n,from){var d=from?parse(from):new Date();d.setDate(d.getDate()+n);return iso(d);}
function diffDays(s){return Math.round((parse(s)-parse(todayIso()))/86400000);}
function fmtDate(s){return s?parse(s).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}):'Not set';}
function fmtFull(s){return s?parse(s).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'Not set';}
function kes(n){var r=Math.round(n);return (r<0?'-':'')+'KES '+Math.abs(r).toLocaleString('en-KE');}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return 'x'+Math.random().toString(36).slice(2,9);}
function num(v){var n=parseFloat(v);return isNaN(n)?0:n;}
function pad(n){return n<100?String(n).padStart(2,'0'):String(n);}
function load(k){try{var r=localStorage.getItem(k);if(r)return JSON.parse(r);}catch(e){}return null;}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
