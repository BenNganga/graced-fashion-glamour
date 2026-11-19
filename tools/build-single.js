/* Bundles one account folder into a single HTML file that needs nothing beside it.
   Use it when the multi-file version will not open (for example on a phone), or to share one file.

   Usage (from the project folder):
     node tools/build-single.js                 -> silky-stylish/dist/silky-stylish-single.html
     node tools/build-single.js silky-stylish   -> same, naming the account folder
   The single file has its own login screen and uses the same accounts as shared/auth.js. */
const fs = require('fs');
const path = require('path');

const app = process.argv[2] || 'silky-stylish';
const root = path.join(__dirname, '..');
const dir = path.join(root, app);
const read = (p) => fs.readFileSync(p, 'utf8');
if (!fs.existsSync(path.join(dir, 'index.html'))) {
  console.error('No index.html found in ' + app); process.exit(1);
}

const html = read(path.join(dir, 'index.html'));
const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || app;
const brand = title;
const fonts = (html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/) || [''])[0];
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)"/g)].map((m) => m[1]);
const jsFiles = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);

let css = cssFiles.map((f) => '/* ' + f + ' */\n' + read(path.join(dir, f))).join('\n');
const loginCss = path.join(dir, 'css', 'login-single.css');
if (fs.existsSync(loginCss)) css += '\n' + read(loginCss);

// page body: keep the markup, drop scripts and the noscript note, start with the app hidden
let body = html.split('<body>')[1].split('</body>')[0];
body = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
body = body.replace('<div id="app">', '<div id="app" hidden>');

const loginView = `  <main class="login" id="loginView" hidden>
    <div class="brand"><span>Graced Fashion and Glamour</span><h1>${brand}</h1></div>
    <form class="box" id="loginForm">
      <div class="field"><label for="u">Username</label><input id="u" name="username" required autocomplete="username" autocapitalize="none" spellcheck="false"></div>
      <div class="field"><label for="p">Password</label><input id="p" name="password" type="password" required autocomplete="current-password"></div>
      <p class="err" id="err" role="alert" hidden>That username or password is not right. Try again.</p>
      <button class="submit" type="submit">Sign in</button>
    </form>
  </main>`;

// shared/auth.js: in a single page, show the login view instead of moving to another page
let auth = read(path.join(root, 'shared', 'auth.js'));
const oldReq = `  require:function(id){
    if(getSession()===id)return true;
    location.replace('../index.html');
    return false;
  },
  logout:function(){setSession(null);location.replace('../index.html');},`;
if (!auth.includes(oldReq)) { console.error('shared/auth.js changed: update the replacement in tools/build-single.js'); process.exit(1); }
auth = auth.replace(oldReq, `  require:function(id){
    var login=document.getElementById('loginView'),appEl=document.getElementById('app');
    if(getSession()===id){login.hidden=true;appEl.hidden=false;document.body.classList.remove('login-page');return true;}
    login.hidden=false;appEl.hidden=true;document.body.classList.add('login-page');
    return false;
  },
  logout:function(){setSession(null);location.reload();},`);

const scripts = jsFiles.map((f) => {
  const code = f === '../shared/auth.js' ? auth : read(path.join(dir, f));
  return '<script>\n/* ' + f + ' */\n' + code + '\n</script>';
});
const loginScript = `<script>
/* login form */
document.getElementById('loginForm').addEventListener('submit',function(e){
  e.preventDefault();
  var acc=GFG_AUTH.login(document.getElementById('u').value,document.getElementById('p').value);
  if(acc&&acc.id===${JSON.stringify(app)}){location.reload();return;}
  if(acc)GFG_AUTH.clear();
  document.getElementById('err').hidden=false;var p=document.getElementById('p');p.value='';p.focus();
});
</script>`;
// the login form script goes right after auth.js (index 0), before the app files
scripts.splice(1, 0, loginScript);

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${fonts}
<style>
${css}
</style>
</head>
<body class="login-page">
${loginView}
${body}
${scripts.join('\n')}
</body>
</html>
`;
const outDir = path.join(dir, 'dist');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, app + '-single.html');
fs.writeFileSync(outFile, out);
console.log('Built ' + path.relative(root, outFile) + ' (' + Math.round(out.length / 1024) + ' KB, ' + jsFiles.length + ' scripts, ' + cssFiles.length + ' stylesheets)');
