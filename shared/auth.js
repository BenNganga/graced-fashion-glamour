/* Shared login for Graced Fashion and Glamour.
   Passwords are never stored in plain text here, only a salted SHA-256 hash.
   To change a password run:  node tools/hash.js "NewPassword"
   then paste the salt and hash into the matching account below.
   NOTE: this runs in the browser, so it keeps casual visitors out but is not
   real security. Real security needs a server (see README). */
(function(){
'use strict';

function sha256hex(str){
  var maxWord=Math.pow(2,32),K=[],H=[],composite={},p=0,c;
  for(c=2;p<64;c++){
    if(!composite[c]){
      for(var i=0;i<313;i+=c)composite[i]=c;
      if(p<8)H[p]=(Math.pow(c,0.5)*maxWord)|0;
      K[p++]=(Math.pow(c,1/3)*maxWord)|0;
    }
  }
  var bytes=new TextEncoder().encode(str),l=bytes.length;
  var total=((l+9+63)>>6)<<6,buf=new Uint8Array(total);
  buf.set(bytes);buf[l]=0x80;
  var dv=new DataView(buf.buffer);
  dv.setUint32(total-8,Math.floor(l*8/maxWord));
  dv.setUint32(total-4,(l*8)>>>0);
  var w=new Array(64),h=H.slice(0);
  function rr(v,n){return (v>>>n)|(v<<(32-n));}
  for(var off=0;off<total;off+=64){
    for(var t=0;t<16;t++)w[t]=dv.getUint32(off+t*4);
    for(t=16;t<64;t++){
      var s0=rr(w[t-15],7)^rr(w[t-15],18)^(w[t-15]>>>3);
      var s1=rr(w[t-2],17)^rr(w[t-2],19)^(w[t-2]>>>10);
      w[t]=(w[t-16]+s0+w[t-7]+s1)|0;
    }
    var a=h[0],b=h[1],cc=h[2],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];
    for(t=0;t<64;t++){
      var S1=rr(e,6)^rr(e,11)^rr(e,25),ch=(e&f)^(~e&g);
      var t1=(hh+S1+ch+K[t]+w[t])|0;
      var S0=rr(a,2)^rr(a,13)^rr(a,22),mj=(a&b)^(a&cc)^(b&cc);
      var t2=(S0+mj)|0;
      hh=g;g=f;f=e;e=(d+t1)|0;d=cc;cc=b;b=a;a=(t1+t2)|0;
    }
    h[0]=(h[0]+a)|0;h[1]=(h[1]+b)|0;h[2]=(h[2]+cc)|0;h[3]=(h[3]+d)|0;
    h[4]=(h[4]+e)|0;h[5]=(h[5]+f)|0;h[6]=(h[6]+g)|0;h[7]=(h[7]+hh)|0;
  }
  return h.map(function(x){return ('00000000'+(x>>>0).toString(16)).slice(-8);}).join('');
}

/* id is the folder name of the account's app. usernames are matched without case. */
var ACCOUNTS=[
  {id:'silky-stylish',name:'Silky Stylish',page:'silky-stylish/index.html',usernames:['silky.stylish'],salt:'6e0c4c64557fd0be',hash:'533e556235d27b0d4db59df153a9a45740c4d1091c3739392863323a97caf833'},
  {id:'custom-couture',name:'Custom Couture',page:'custom-couture/index.html',usernames:['custom.couture'],salt:'3001fe5ad2d1a05f',hash:'bc00f32b6b668952ea097470e3edd303ab681747db3abe226cdb9cc5d93bfcc9'},
  {id:'fashion-glamour-ke',name:'Fashion Glamour KE',page:'fashion-glamour-ke/index.html',usernames:['fashion.glamour','fashion.glamour.ke'],salt:'c0b34f5344fc4736',hash:'9497320563b10d12c734aee810751dbe8abbb95180754b85b0f47d2db92d5f90'}
];
var SESSION_KEY='gfg-session';

function setSession(id){try{if(id)sessionStorage.setItem(SESSION_KEY,id);else sessionStorage.removeItem(SESSION_KEY);}catch(e){}}
function getSession(){try{return sessionStorage.getItem(SESSION_KEY);}catch(e){return null;}}

window.GFG_AUTH={
  sha256hex:sha256hex,
  accounts:ACCOUNTS,
  /* Returns the matching account or null. */
  login:function(username,password){
    var u=String(username||'').trim().toLowerCase();
    for(var i=0;i<ACCOUNTS.length;i++){
      var a=ACCOUNTS[i];
      if(a.usernames.indexOf(u)>-1&&sha256hex(a.salt+':'+password)===a.hash){setSession(a.id);return a;}
    }
    return null;
  },
  /* Call at the top of an account's app. Sends visitors back to login unless they signed in to this account. */
  require:function(id){
    if(getSession()===id)return true;
    location.replace('../index.html');
    return false;
  },
  logout:function(){setSession(null);location.replace('../index.html');},
  session:getSession,
  clear:function(){setSession(null);}
};
})();
