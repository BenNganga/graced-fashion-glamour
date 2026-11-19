# Graced Fashion and Glamour

One login (index.html) -> three SEPARATE accounts. Each account is its own folder with its own
pages, styles and scripts, so changing one never touches the others.

## Tree

```
graced-fashion-glamour/
├── index.html                  Hub login (sends you to your own account)
├── README.md
├── shared/                     Only things all accounts use
│   ├── auth.js                   Usernames + hashed passwords, login/logout/session
│   └── login.css                 Look of the login page
├── tools/
│   ├── hash.js                   node tools/hash.js "NewPassword"  -> new password hash
│   └── build-single.js           node tools/build-single.js silky-stylish -> one-file backup
│
├── silky-stylish/              ACCOUNT 1 (built)
│   ├── index.html
│   ├── css/   base, components, modal, calendar, tables-charts
│   ├── js/
│   │   ├── config.js  util.js  ui.js  main.js
│   │   ├── model/  orders.js  sample.js  state.js  finance.js
│   │   ├── lib/    chart.js
│   │   ├── sync/   phone-links.js  google-calendar.js
│   │   └── views/  dashboard.js  orders.js  calendar.js  track.js  revenue.js
│   └── dist/silky-stylish-single.html   (generated one-file fallback)
│
├── custom-couture/             ACCOUNT 2 (placeholder, waiting)
│   ├── index.html
│   ├── css/styles.css
│   └── js/main.js
│
└── fashion-glamour-ke/         ACCOUNT 3 (placeholder, waiting)
    ├── index.html
    ├── css/styles.css
    └── js/main.js
```

## Where to change what (Silky Stylish)

| I want to change...                    | Edit                         |
|----------------------------------------|------------------------------|
| Tailors, statuses, business settings   | js/config.js                 |
| Order numbers (GFG-01), balances       | js/model/orders.js           |
| Revenue / profit maths                 | js/model/finance.js          |
| Track orders tables + Move buttons     | js/views/track.js            |
| Calendar page                          | js/views/calendar.js         |
| Revenue page and graphs                | js/views/revenue.js, lib/chart.js |
| Google Calendar sync                   | js/sync/google-calendar.js   |
| Colours / layout                       | css/*.css                    |

## Open in VS Code
1. Unzip, File > Open Folder > graced-fashion-glamour.
2. Install the "Live Server" extension, right-click index.html > Open with Live Server.
   (Google Calendar sync needs http://, so use Live Server rather than double-clicking.)
3. If a file is missing, the page names it on screen instead of staying blank.
4. Backup: `node tools/build-single.js silky-stylish` then open silky-stylish/dist/silky-stylish-single.html.

## Logins
Usernames: Silky.stylish, custom.couture, fashion.glamour (passwords are stored only as hashes).
Change a password: `node tools/hash.js "NewPassword"` and paste the hash into shared/auth.js.
Note: this login runs in the browser, so it keeps casual visitors out but is not real security.
