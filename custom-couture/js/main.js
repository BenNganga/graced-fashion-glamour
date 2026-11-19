/* Custom Couture / js/main.js
   Starts this account's page. Add this account's files next to this one. */
'use strict';

(function(){
  if(!GFG_AUTH.require('custom-couture'))return;
  document.getElementById('logout').addEventListener('click',function(){GFG_AUTH.logout();});
})();
