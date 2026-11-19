/* Silky Stylish / js/lib/chart.js
   Draws the line charts (SVG). Used by the Revenue page. */
'use strict';

function niceStep(range,count){var raw=(range||1)/count,mag=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)),r=raw/mag;return (r<=1?1:r<=2?2:r<=5?5:10)*mag;}
function kfmt(v){var a=Math.abs(v),s=a>=1e6?(a/1e6).toFixed(a%1e6?1:0)+'M':a>=1000?(a/1000).toFixed(a%1000?1:0)+'k':String(Math.round(a));return (v<0?'-':'')+s;}
function lineChart(pts,opt){
  var W=560,H=240,L=54,R=22,T=40,B=34,pw=W-L-R,ph=H-T-B;
  var vals=pts.map(function(p){return p.v;}),lo=Math.min(0,Math.min.apply(null,vals)),hi=Math.max(1,Math.max.apply(null,vals));
  var step=niceStep(hi-lo,4);if(!opt.money)step=Math.max(1,step);lo=Math.floor(lo/step)*step;hi=Math.ceil(hi/step)*step;if(hi===lo)hi=lo+step;
  function X(i){return L+(pts.length>1?pw*i/(pts.length-1):pw/2);}
  function Y(v){return T+ph*(1-(v-lo)/(hi-lo));}
  var s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opt.label)+'">',v;
  for(v=lo;v<=hi+step/2;v+=step){var y=Y(v).toFixed(1);s+='<line class="grid'+(Math.abs(v)<1e-9?' zero':'')+'" x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'"/><text class="tick" x="'+(L-8)+'" y="'+(+y+4)+'" text-anchor="end">'+(opt.money?kfmt(v):Math.round(v))+'</text>';}
  var every=Math.ceil(pts.length/7);
  pts.forEach(function(p,i){if((pts.length-1-i)%every===0)s+='<text class="tick" x="'+X(i).toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle">'+esc(p.label)+'</text>';});
  var base=Y(Math.max(0,lo)).toFixed(1),path='';
  pts.forEach(function(p,i){path+=(i?'L':'M')+X(i).toFixed(1)+' '+Y(p.v).toFixed(1)+' ';});
  s+='<path class="area" d="'+path+'L'+X(pts.length-1).toFixed(1)+' '+base+' L'+X(0).toFixed(1)+' '+base+' Z"/><path class="ln" d="'+path.trim()+'"/>';
  pts.forEach(function(p,i){
    var last=i===pts.length-1;
    s+='<circle class="pt" cx="'+X(i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="'+(last?5:3)+'"><title>'+esc(p.label+': '+(opt.money?kes(p.v):p.v))+'</title></circle>';
  });
  var lp=pts[pts.length-1],ly=Y(lp.v);
  s+='<text class="val" x="'+X(pts.length-1).toFixed(1)+'" y="'+(ly-11).toFixed(1)+'" text-anchor="end">'+esc(opt.money?kes(lp.v):lp.v)+'</text>';
  return s+'</svg>';
}
