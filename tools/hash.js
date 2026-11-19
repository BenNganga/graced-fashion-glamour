/* Usage: node tools/hash.js "NewPassword"
   Prints a new salt and hash to paste into shared/auth.js */
const crypto = require('crypto');
const pw = process.argv[2];
if (!pw) { console.error('Usage: node tools/hash.js "NewPassword"'); process.exit(1); }
const salt = crypto.randomBytes(8).toString('hex');
const hash = crypto.createHash('sha256').update(salt + ':' + pw).digest('hex');
console.log("salt:'" + salt + "',hash:'" + hash + "'");
