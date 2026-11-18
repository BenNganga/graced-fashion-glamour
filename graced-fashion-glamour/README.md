# Graced Fashion and Glamour

One login page, three separate accounts. Each account is its own folder and its own page.

```
index.html                 Login page (start here)
shared/auth.js             Accounts and login check
shared/login.css           Login page styling
silky-stylish/             Silky Stylish: dashboard, orders, calendar (built)
custom-couture/            Custom Couture (set up, system still to build)
fashion-glamour-ke/        Fashion Glamour KE (set up, system still to build)
tools/hash.js              Makes a new password hash
```

## Open it in VS Code

1. Unzip and use **File > Open Folder** on `graced-fashion-glamour`.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` and choose **Open with Live Server**.

No Live Server? From the folder run `python -m http.server 8000` and open http://localhost:8000.
Opening `index.html` by double-click also works.

## Accounts

| Account | Username |
| --- | --- |
| Silky Stylish | `silky.stylish` |
| Custom Couture | `custom.couture` |
| Fashion Glamour KE | `fashion.glamour` (or `fashion.glamour.ke`) |

Usernames ignore capital letters. Passwords are not written in the code, only salted hashes.

### Change a password

```
node tools/hash.js "NewPassword"
```

Paste the printed `salt` and `hash` into that account in `shared/auth.js`.

## Silky Stylish

- `silky-stylish/index.html` page structure
- `silky-stylish/styles.css` colours and layout (all colours are variables at the top)
- `silky-stylish/app.js` orders, money, calendar and the Google Calendar links

Orders are numbered GFG-01, GFG-02 and so on. Data is saved in the browser (localStorage), so it stays on the computer and browser you use. It starts with example orders and a button to clear them.

## Things to know

- The login runs in the browser. It keeps casual visitors out but is not real security, because anyone who can open the files can read the code. For real security and data shared across phones and computers, the next step is a small backend with a database.
- The phone calendar buttons open Google Calendar with the event filled in. A web page cannot send phone notifications by itself.
