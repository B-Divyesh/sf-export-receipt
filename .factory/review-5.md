# Adversarial first-read review 5 — Export Receipt

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against the live deployment and commit
`55ef65b731b28b5a2f0951a46a73a92b5bb560ca`. This was a fresh-browser,
phone-first review, not a diff-only check. One blocking routing regression
remains; therefore the required zero-finding standard is not met.

## Thirty-second cold read

### Phone, 390 × 844

- What it does: checks a downloaded service export before the account is gone.
- For whom: someone leaving a service or making a backup.
- First click: **Try it with sample data**.

All three answers are visible without scrolling. The exact first-screen copy
that establishes them is **“Check your export before access ends”**, **“For
people leaving a service, see what your export contains before an account
disappears.”**, and **“Try it with sample data”** / **“Loads a sample receipt
now.”** The action and the three privacy, offline, and price facts finish at
599 px in the 844 px viewport.

### Desktop, 1440 × 900

The same three answers are immediately visible, beside the original
archive-workbench image. The layout is product-specific rather than a generic
SaaS hero: paper ground, ink rules, square receipt panels, hard shadows, and
the archive/evidence illustration match `.factory/design.md`.

## Finding

### Blocking

#### F-5-1 (reopens F-1-3) — A controlled PWA session turns an unknown URL into HTTP 200

- Exact quote/location: `public/sw.js:11`, **“if (event.request.mode ===
  'navigate' … cache.match('/index.html')”**. Live controlled navigation to
  `https://export-receipt.sociobot.in/review-five-controlled-404` returned
  **200**, while showing **“That page is not here”** and the title **“Page not
  found — Export Receipt”**.
- Evidence: in a fresh Chromium context, I opened `/`, waited until
  `navigator.serviceWorker.controller` was truthy, then navigated to the
  unknown URL. Playwright recorded status 200. A cold network-only unknown
  URL does return the static 404, which is why the current check misses this
  state.
- Why this is blocking: an already-visited PWA has broken HTTP 404 behavior.
  A copied bad link is made to look like a valid successful document to the
  browser, caches, and any status-aware client. This regresses the same
  designed-404 requirement addressed by F-1-3; visual fallback alone is not a
  real 404 route.
- Concrete fix: make the service worker return the precached application shell
  only for the declared routes (`/`, `/demo`, `/privacy`, `/terms`, and
  `/receipt`). For an unrecognised navigation, use `fetch(event.request)` so
  Static Web Apps can return `/404.html` with status 404. Add a browser test
  that first establishes service-worker control, then opens an unknown route
  and asserts status 404, the designed 404 heading, shared navigation, and no
  console error.

## Copy audit

Word counts treat ZIP, JSON, CSV, TXT, SHA-256, URLs, and version strings as
one word. All counts are at or below 22. No banned marketing adjective,
jargon-only slogan, term conflict, mood heading, or non-result-naming button
was found. Headings and controls are included so the button and heading checks
are explicit.

### Landing page

| Copy | Words | Result |
|---|---:|---|
| Skip to main content | 4 | pass |
| EXPORT RECEIPT | 2 | pass |
| Demo | 1 | pass |
| How it works | 3 | pass |
| Privacy | 1 | pass |
| Use dark colors / Use light colors | 3 / 3 | pass |
| LOCAL EXPORT CHECK | 3 | pass |
| Check your export before access ends | 6 | pass |
| For people leaving a service, see what your export contains before an account disappears. | 14 | pass |
| Try it with sample data | 5 | pass |
| Loads a sample receipt now. | 5 | pass |
| Your export stays on this device | 6 | pass |
| Works offline after first visit | 5 | pass |
| Free to use · no account needed | 7 | pass |
| An export folder, magnifier, and printed data receipt on a workbench. | 11 | pass (alt text) |
| Inspect the export, then keep the receipt. | 7 | pass |
| CHECK YOUR EXPORT | 3 | pass |
| Open an export to make a receipt | 7 | pass |
| Choose a ZIP, JSON, CSV, or text export. | 8 | pass |
| Nothing is uploaded. | 3 | pass |
| Choose an export | 3 | pass |
| ZIP · JSON · CSV · TXT | 4 | pass |
| How Export Receipt checks an export | 6 | pass |
| Choose | 1 | pass |
| Open an export on this device. | 6 | pass |
| Inspect | 1 | pass |
| Count files, dates, supported categories, attachments, and parse errors. | 9 | pass |
| Keep | 1 | pass |
| Download an HTML receipt, or check a signed JSON receipt against its bundled signature. | 14 | pass |
| What this does not do | 5 | pass |
| It inspects only the export you choose. | 7 | pass |
| It does not connect to your service account. | 8 | pass |
| Export Receipt checks local exports before access disappears. | 8 | pass |
| Terms | 1 | pass |
| Built by Param Factory | 4 | pass |
| v1.0.2 | 1 | pass |
| An update is ready. | 4 | pass |
| Reload | 1 | pass |

### README

| Sentence / heading | Words | Result |
|---|---:|---|
| Export Receipt | 2 | pass |
| Check a data export before access ends. | 7 | pass |
| It is for people leaving a service or making a backup. | 11 | pass |
| It records files, dates, missing categories, unreadable data, and next checks. | 11 | pass |
| The app reads ZIP, JSON, CSV, and text exports in the browser. | 11 | pass |
| It hashes the complete export and parses readable data. | 8 | pass |
| It flags unsafe paths and supported missing categories. | 8 | pass |
| You can download an HTML receipt or a signed JSON receipt. | 11 | pass |
| The app checks a JSON receipt against its bundled signature. | 10 | pass |
| This check cannot identify its signer or detect editing followed by re-signing. | 12 | pass |
| Exports are not uploaded. | 4 | pass |
| Export Receipt is free to use without an account. | 9 | pass |
| Category checks support Harbor Mail, Google Takeout, and Meta Download exports. | 10 | pass |
| If an export matches more than one layout, the receipt says so instead of guessing. | 16 | pass |
| Exports must be 50 MB or smaller. | 8 | pass |
| ZIPs must contain at most 1,000 entries, expand to 50 MB or less, and stay below 100:1 compression. | 18 | pass |
| JSON and CSV files over 20 MB are inventoried but not parsed. | 12 | pass |
| Run | 1 | pass |
| Requires Node 20 or newer. | 5 | pass |
| Open `http://localhost:5173/demo` or `http://localhost:5173/?demo=1` for the isolated sample. | 8 | pass |
| It inspects the shipped Harbor Mail ZIP in memory and stores nothing. | 11 | pass |
| Verify and build | 3 | pass |
| Browser tests cover every registered claim. | 6 | pass |
| They also check demo isolation, Back and Home navigation, limits, downloads, offline use, and keyboard access. | 16 | pass |
| Route metadata, the sitemap, the 404 page, and both color modes are checked too. | 14 | pass |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | pass |
| Deploy that directory with the included `staticwebapp.config.json`. | 7 | pass |
| Privacy | 1 | pass |
| Export Receipt has no account, analytics, server API, or export upload. | 10 | pass |
| Color mode is the only browser preference it stores outside demo mode. | 11 | pass |
| See `/privacy` and `/terms` in the app. | 7 | pass |
| It is released under the MIT License. | 8 | pass |
| Catalog description | 2 | pass |
| Check a service export before access ends, then save a local receipt of files, dates, gaps, and warnings. | 18 | pass |

The first-screen claims are registered and exercised: sample inventory,
local-only handling, offline reload, and account-free use. Other landing
claim-like copy maps to supported formats, safe limits, recognized layouts,
and the receipt download/verification claims. No unlisted live landing claim
was found.

## Demo, privacy, and claims

- **One-click demo:** pass. The first post-click screen is the four-file Harbor
  Mail inspection, not an empty picker. It shows readable-file and attachment
  inventory, date coverage, and the missing Profile category.
- **Demo isolation:** pass. `/demo` and `/?demo=1` show **“Demo — sample data,
  nothing is saved”**, Reset demo, and Start for real. Reset, color changes,
  Start for real, Back, and Home left seeded real browser storage unchanged;
  no data/API or cross-origin request occurred.
- **Privacy/offline:** pass. Request logging during the demo and real-file
  flow found no external, API, credential, cookie, or upload traffic. After a
  first demo visit, an offline reload restored the complete sample receipt.
- **Claims:** pass. In a clean clone, `npm ci`, `npm test`, and all 14 exact
  claim commands in `.factory/claims.json` passed: sample-inventory,
  local-only, json-receipt, html-receipt, supported-formats, source-hash,
  parse-errors, offline-reload, account-free, preference-storage,
  demo-isolation, safe-archive-limits, recognized-layouts, and
  receipt-verification. `npm run lint` and `npm run build` also passed; build
  produced `dist/` with a 10.06 kB gzip app bundle.

## Structure and quality checks

The five declared app routes have route-specific titles, descriptions,
canonical URLs, Open Graph and Twitter metadata, one h1, main, header/footer,
skip link, focus-on-route-change behavior, legal links, and mobile layout.
The designed cold 404 has correct metadata and server status. The full live
route/axe/privacy/offline verification passed with no unexpected console
errors. All discovered links returned 200 (or were valid in-page anchors),
including the repository issues link. The sole exception is F-5-1: the
service-worker-controlled unknown route returns 200.

No AI feature is needed for this local export inspection job; adding one would
not improve the implied job-to-be-done. Import, the realistic sample, local
inspection, and HTML/JSON export are present.

## Earlier findings rechecked

| Earlier finding | Live and code confirmation |
|---|---|
| F-1-1 | One-visit controlled offline demo reload shows the four-file receipt. |
| F-1-2 | Demo state and demo color use remain memory-only; exit/reset preserves real storage. |
| F-1-3 | **Reopened as F-5-1:** cold 404 is fixed, but controlled PWA unknown routing returns 200. |
| F-1-4 | `/?demo=1` normalizes to `/demo` and shows the sample/banner. |
| F-1-5 | At 390 px the action, explanation, and three facts are visible before 599 px. |
| F-1-6 | `/receipt` is a real, titled empty state with real and sample start actions. |
| F-1-7 | `/`, `/demo`, `/privacy`, `/terms`, `/receipt`, and cold 404 have distinct metadata. |
| F-1-8 | Harbor Mail, Google Takeout, and Meta Download fixtures pass recognition/missing/ambiguous checks. |
| F-1-9 | HTML says it is unsigned; JSON verification discloses the bundled-key/re-signing limit. |
| F-1-10 | Visitor input terminology is consistently **export**. |
| F-1-11 | Color controls say **Use dark colors** / **Use light colors**. |
| F-1-12 to F-1-15 | README copy audit above confirms short, direct sentences and tested features/limits. |
| F-2-1 | Mobile header retains 44 px Demo and Privacy controls. |
| F-3-1 | Back and wordmark Home exit demo, discard the sample, and focus the landing h1. |
| F-3-2 | Sitemap includes `/receipt` and all declared app routes. |
| F-3-3 | Landing label is **CHECK YOUR EXPORT**, not the former metaphor. |
| F-3-4 | Terms h1 is **Terms for using Export Receipt**. |
| F-3-5 | Privacy gives a live, named repository issues link. |
| F-3-6 | Hero caption is the useful **Inspect the export, then keep the receipt.** |
| F-4-1 | The UI no longer attributes the signature to the current browser or claims re-signing detection. |
| F-4-2 | Demo hash matches the shipped 869-byte ZIP in UI and downloads. |
| F-4-3 | The first screen now gives direct device, offline, and free/no-account facts. |
| F-4-4 | Every checked app/status route uses **Skip to main content** for `#main`. |
| F-4-5 | ZIP wording and tests use **at most 1,000 entries** and **at most 50 MB**. |

## What would make this perfect

Preserve a true HTTP 404 after service-worker activation, and cover that
controlled-PWA state in the permanent browser suite. With that one routing
regression removed and verified, this review has no other finding.
