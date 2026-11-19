/* Silky Stylish / js/ui.js
   Shared screen parts: drawing the active page, pop-up windows and forms. */
'use strict';

function render(){
  document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('nav').innerHTML=TABS.map(function(t){return '<button data-tab="'+t[0]+'" aria-current="'+(t[0]===tab)+'">'+t[1]+'</button>';}).join('');
  var q=document.activeElement&&document.activeElement.id==='oq';
  document.getElementById('view').innerHTML=({dash:dash,orders:orders,track:track,rev:revenue,cal:calendar})[tab]();
  if(q){var el=document.getElementById('oq');el.focus();el.setSelectionRange(el.value.length,el.value.length);}
}
function showModal(html,label){
  document.getElementById('modalRoot').innerHTML='<div class="overlay" id="ov"><div class="modal" role="dialog" aria-label="'+esc(label)+'">'+html+'</div></div>';
  document.getElementById('ov').addEventListener('mousedown',function(e){if(e.target.id==='ov')cancelForm();});
}
function closeForm(){document.getElementById('modalRoot').innerHTML='';}
function cancelForm(){pendingView=null;closeForm();}
function fld(f){
  if(f.type==='heading')return '<h3>'+esc(f.label)+'</h3>';
  var v=f.value==null?'':f.value,h='<div class="field"><label for="f_'+f.id+'">'+esc(f.label)+'</label>';
  if(f.options)h+='<select id="f_'+f.id+'">'+f.options.map(function(o){return '<option value="'+esc(o)+'"'+(o===v?' selected':'')+'>'+esc(o)+'</option>';}).join('')+'</select>';
  else if(f.type==='textarea')h+='<textarea id="f_'+f.id+'" rows="2">'+esc(v)+'</textarea>';
  else h+='<input id="f_'+f.id+'" type="'+(f.type||'text')+'" value="'+esc(v)+'"'+(f.req?' required':'')+(f.readonly?' readonly tabindex="-1"':'')+(f.type==='number'?' min="0" step="any" inputmode="decimal"':'')+'>';
  return h+'</div>';
}
function openForm(title,fields,onSave,saveLabel,intro){
  var h='<form id="mf"><h2>'+esc(title)+'</h2>'+(intro||''),i=0;
  while(i<fields.length){var f=fields[i];if(f.half&&fields[i+1]&&fields[i+1].half){h+='<div class="two">'+fld(f)+fld(fields[i+1])+'</div>';i+=2;}else{h+=fld(f);i++;}}
  h+='<div class="actions"><button type="button" class="btn" id="mc">Cancel</button><button type="submit" class="btn primary">'+(saveLabel||'Save')+'</button></div></form>';
  showModal(h,title);
  document.getElementById('mc').onclick=cancelForm;
  document.getElementById('mf').onsubmit=function(e){
    e.preventDefault();var vals={};
    fields.forEach(function(f){if(f.type!=='heading')vals[f.id]=document.getElementById('f_'+f.id).value;});
    onSave(vals);save();closeForm();render();
    if(pendingView){var p=pendingView;pendingView=null;var o=byId(p);if(o)viewOrder(o);}
  };
  var first=document.getElementById('mf').querySelector('input,select');if(first)first.focus();
}
