# Tejas Lifespaces: interactive site prototype

A single-page rebuild of tejaslifespaces.com that turns visitors into leads. It uses plain HTML, CSS and JS with no build step and no dependencies.

## Run it

Double-click `index.html`, or serve it locally:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Project layout

```
index.html      page structure
css/style.css   all styling (colour tokens at the top)
js/data.js      ← ALL content lives here: projects, phone numbers, WhatsApp, about text
js/app.js       interactivity
```

To add a project, change a phone number or set a price, edit `js/data.js` only.

## What's interactive

| Feature | Why it matters for sales |
|---|---|
| Hero "Find homes" search (city, BHK, status) | Visitors jump straight to matching projects |
| "Now selling" spotlight, auto-rotating, with MahaRERA badge | Ongoing projects are the first thing people see |
| Project explorer: status tabs, city/BHK filters, live search, first 8 cards + "Show all" | Every project with photos, without an endless grid |
| Legacy skyline: each of the 35 delivered projects drawn as a building, grouped by locality, with filter chips and tap-for-details | Turns the photo-less heritage list into proof of track record; search matches in the explorer light up here |
| ♥ Shortlist (saved in the browser) + "enquire about these on WhatsApp" | Turns browsing into a single enquiry |
| Project detail modal: gallery, lightbox (keyboard + swipe), amenities, connectivity, map | Replaces the thin project pages |
| Shareable project links (`index.html#p/vaishnavi`) + Share button | The sales team can WhatsApp a direct link to one project |
| Location explorer: tap a landmark to move the map and get directions | Shows off the airport, Atal Setu and Metro advantage |
| EMI calculator with live donut chart | Keeps buyers on the page and feeds the "loan desk" lead |
| 3-step site-visit booking (project → slot → details) | Main conversion; ends with a prefilled WhatsApp message |
| Price-list popup (after 35s or on exit intent, once per session) | Captures people who are about to leave |
| Floating WhatsApp/Call buttons; sticky Call/WhatsApp/Book bar on mobile | One tap to contact the sales team |
| Scroll progress, reveal animations, animated counters | Polish; respects "reduce motion" settings |

## Where leads go

1. **WhatsApp:** every form ends with a prefilled WhatsApp message to `CONFIG.whatsapp`.
2. **Browser storage:** leads are saved in the visitor's own browser (`localStorage.tejas_leads`). This is useful for demos, but the sales team can't see them.
3. **Your backend (recommended):** set `CONFIG.leadEndpoint` to a URL that accepts POSTed JSON. The simplest free option is a Google Sheet:
   - Sheet → Extensions → Apps Script, paste:
     ```js
     function doPost(e) {
       const d = JSON.parse(e.postData.contents);
       SpreadsheetApp.getActiveSheet().appendRow([new Date(), d.type, d.project, d.config || d.intent, d.name, d.phone, d.email || "", d.date || "", d.time || "", d.pickup || ""]);
       return ContentService.createTextOutput("ok");
     }
     ```
   - Deploy → Web app → access "Anyone" → paste the URL into `leadEndpoint`.

## Before going live: TODO

- [ ] Confirm **97692 88956** is on WhatsApp (or change `CONFIG.whatsapp`)
- [ ] Add **starting prices** and **possession dates** (`price`, `possession` in data.js). Projects show "Price on request" until then.
- [ ] Settle **years of legacy**: the home page says 18+, the About page says 12+ (`CONFIG.yearsOfLegacy`)
- [ ] Add Facebook / Instagram / YouTube URLs (`CONFIG.social`)
- [ ] Add carpet areas and floor plans if available
- [ ] Download the images into an `img/` folder instead of hot-linking them from the WordPress site
- [ ] **Security:** the live WordPress home page contains hidden injected casino/spam links. The current site's hosting/WordPress should be cleaned up regardless of this rebuild.

## Mobile support

Tested at 320 (iPhone SE), 360 (Android), 390 (iPhone 14), 430 (Pro Max), 844×390 landscape, 768 and 1024 tablets: no sideways scrolling, tap targets ≥ 44px, no iOS zoom-on-focus, safe-area aware for notched iPhones. Phones get a sticky Call / WhatsApp / Book bar instead of floating buttons, full-screen project sheets, and no timed popup.

## Share it / deploy

It's a static folder, so any static host works.

**GitHub Pages (free):**
```bash
cd ~/learnings/tejasLifespaces
git init && git add . && git commit -m "Tejas Lifespaces preview"
git branch -M main
git remote add origin https://github.com/<you>/tejas-lifespaces.git   # create the repo on github.com first
git push -u origin main
```
Then on GitHub, go to repo → Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)` → Save.
After about a minute it's live at `https://<you>.github.io/tejas-lifespaces/`.
On a free account the repo must be **public** for Pages to work.

**Netlify Drop (fastest, no git):** go to app.netlify.com/drop and drag the folder in. You get a URL instantly, and the repo can stay private.

**Going live for real:** delete `robots.txt` and the `<meta name="robots" content="noindex…">` line in `index.html`, then point the domain at the host.
