/* Fashion Glamour KE / js/main.js
   Starts this account's page. Add this account's files next to this one. */
'use strict';

(function(){
  if(!GFG_AUTH.require('fashion-glamour-ke'))return;
  document.getElementById('logout').addEventListener('click',function(){GFG_AUTH.logout();});
})();
