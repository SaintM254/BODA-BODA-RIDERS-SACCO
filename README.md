# Boda Boda Riders Sacco

A working front-end prototype of a savings and credit co-operative (SACCO) for boda boda riders in Kenya, built from the original single-page `index.html`.

**Live site:** https://saintm254.github.io/BODA-BODA-RIDERS-SACCO/

The site is a static build — no server, no build step, no dependencies. Everything is plain HTML, CSS and JavaScript, published with GitHub Pages.

---

## What the site does

Every feature in the brief now actually works in the browser, rather than being a placeholder:

| Feature | Status |
| --- | --- |
| Member sign-up with validation (name, Kenyan phone, ID, stage, PIN) | Works — creates a real account in the browser |
| Log in / log out with phone + 4-digit PIN | Works |
| Daily autosave, locked savings and bike replacement fund | Works — each has its own balance, goal and history |
| Save money by simulated M-Pesa checkout | Works — confirm, then the balance and history update |
| Withdraw daily savings to M-Pesa | Works — locked savings and the bike fund stay locked, as advertised |
| Savings goals with progress bars | Works |
| Loan eligibility (3× savings, capped at KSh 200,000) | Works — live limit on the Loans page and dashboard |
| Loan calculator | Works — amount, period and loan type all recalculate in real time |
| Loan application, approval, repayment and clearing | Works — applications create a loan with a flat-interest schedule |
| Transaction history | Works — every deposit, withdrawal, loan and repayment is listed |
| Dividend projection (12% sample rate) | Works — projected from the locked balance |
| English / Kiswahili switch | Works across every page, including the dashboard and dialogs |
| Advantages and marketing pages | Fully fleshed out with photography |
| Mobile navigation, dialogs, toasts, form errors, keyboard support | Works |

### Demo account

On the **Log in** page, choose **Open the demo account**. It loads a member with savings history and an active loan.

- Phone: `0712 345 678`
- PIN: `1234`

Prefer to start clean? Use **Reset demo data** in the footer at any time.

---

## How the data works

There is no backend, so the prototype keeps everything in the visitor's own browser:

- Accounts, PIN hashes, savings, goals, loans and transactions live in `localStorage` (`bbs.db.v1`).
- The session, language choice and demo state are stored alongside it.
- If `localStorage` is blocked (private mode, some file:// setups), the app transparently falls back to in-memory state for the session.
- PINs are hashed with a simple demo-only function. This is **not** production security — a real SACCO would authenticate on a server.

Nothing is sent anywhere. No real M-Pesa request is made and no money moves.

---

## Project structure

```
index.html                 Page shell, navigation, icon sprite, footer
assets/css/styles.css      Design system and all layouts
assets/js/i18n.js          English → Kiswahili dictionary and translator
assets/js/store.js         Accounts, savings and loan rules (localStorage)
assets/js/app.js           Router, views, dialogs and interactions
assets/img/                Brand assets (logo.svg, logo-touch.png)
assets/photos/             Responsive photos — replace these with your own (see its README)
scripts/make-photos.sh     Regenerates assets/photos/ from full-size originals
assets/favicon.svg         Fallback site icon, used if logo.svg cannot be read
assets/og-image.jpg        1200×630 social preview image
.nojekyll                  Serve files as-is on GitHub Pages
```

The brand logo is `assets/img/logo.svg` — a 1627×886 (≈1.84:1) lockup whose
`viewBox` is trimmed to the artwork, so it scales from a 38 px header mark to a
56 px footer mark without empty margins. It also serves as the favicon, with
`assets/favicon.svg` as the automatic fallback; `logo-touch.png` (180×180) is the
`apple-touch-icon`.

Photos are served responsively: each one exists as `<name>-<width>.avif` with a
`.jpg` fallback, and the markup uses `<picture>` + `srcset`/`sizes`, so a phone
downloads roughly 40 KB instead of 200 KB. Nothing in the HTML refers to a
single fixed image file, so swapping photography means replacing files in
`assets/photos/` only.

### Routes

Hash routing keeps everything working on GitHub Pages without server rewrites:

- `#/home` — marketing home
- `#/savings` — savings products and member balances
- `#/loans` — products, eligibility and the loan calculator
- `#/perks` — advantages of membership
- `#/join` — membership form
- `#/login` — login and demo account
- `#/dashboard` — the member's account (login required)

---

## Run it locally

Any static file server works:

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

Opening `index.html` directly also works in most browsers, though a local server is closer to the live site.

---

## Publishing

The site is published with **GitHub Pages** from the `main` branch, repository root, alongside a Pages workflow in `.github/workflows/deploy-pages.yml`.

One-time setup (needs a repository admin):

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/ (root)**, then **Save**.

The site goes live at https://saintm254.github.io/BODA-BODA-RIDERS-SACCO/ and republishes on every push to `main`.

Prefer the Actions pipeline? Set **Source** to **GitHub Actions** instead and run the **Deploy to GitHub Pages** workflow from the Actions tab — it publishes the same files.

---

## Notes and limits

- All figures (rates, dividends, limits) are sample values for the prototype and are set in `assets/js/store.js` and the loan list in `assets/js/app.js`.
- Photography is AI-generated for this prototype and is illustrative only. Swap it
  in `assets/photos/` — the folder's README and `scripts/make-photos.sh` explain how.
- The site is a demonstration, not a licensed financial product. It does not collect or transmit personal data.
