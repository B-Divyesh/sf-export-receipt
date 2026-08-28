# Adversarial first-read review 2 — Export Receipt

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against <https://export-receipt.sociobot.in> and repository commit `7ce9f7d7599ed7833cf87f40b9e5b4672bda3a01`. This is a full re-review, not a diff review. One minor finding remains; the requested standard permits PASS only with zero findings.

## Thirty-second cold read

### Phone, 390 × 844, fresh context

- What it does: check a data export before access ends and produce a receipt of what is present, missing, and readable.
- For whom: people leaving a service.
- First click: **Try it with sample data**.

All three answers are visible before scrolling. The first screen also includes the immediate result, **“Loads a sample receipt now.”**, and the three privacy/offline/account facts. The button begins at y=404 and is fully visible. There were no load console or page errors.

### Desktop, 1440 × 900, fresh context

The same answers and first action are visible without scrolling. The first action begins at y=636 and is fully visible. The neo-brutalist workbench/receipt system is specific to archive inspection and does not read as a generic SaaS template.

## Finding

### Minor

#### F-2-1 — The mobile header removes all site navigation without a replacement

- Exact location: 390 px live landing and demo header; `src/asset-overrides.css`, `@media (max-width:760px){.site-header nav a{display:none}}`.
- Evidence: on a fresh 390 px load the visible header contains only the **EXPORT RECEIPT** home link and **Use dark colors**. The desktop header has **Demo**, **How it works**, and **Privacy**, but all three links have 0 × 0 geometry on the phone. There is no menu button or other header replacement. Privacy and Terms can only be found after scrolling to the footer.
- Why this matters: the standard site skeleton requires a consistent header with product navigation and Privacy. A phone visitor cannot navigate directly to the demo or privacy explanation from the header; the omission is especially conspicuous on the demo screen, where the first visible header offers no path out except the wordmark.
- Concrete fix: retain compact 44 px **Demo** and **Privacy** links at this breakpoint, or add a 44 px **Open site menu** button that exposes the three existing navigation links with keyboard focus management. Add a 390 px browser assertion that the header exposes a usable Demo and Privacy route.

## Copy audit

Word-count convention: hyphenated terms, URLs, version strings, and code spans count as one word. Labels, headings, visible caption text, and the hidden update text are included. No sentence is over 22 words. No banned marketing adjective or inconsistent visitor-facing term was found. The lone copy-adjacent navigation failure is F-2-1.

### Landing page

| Text | Words | Flag |
|---|---:|---|
| Skip to inspection | 3 | — |
| EXPORT RECEIPT | 2 | — |
| Demo | 1 | F-2-1: hidden at 390 px |
| How it works | 3 | F-2-1: hidden at 390 px |
| Privacy | 1 | F-2-1: hidden at 390 px |
| Use dark colors | 3 | — |
| LOCAL EXPORT CHECK | 3 | — |
| Check your export before access ends | 6 | — |
| For people leaving a service, see what your export contains before an account disappears. | 14 | — |
| Try it with sample data | 5 | — |
| Loads a sample receipt now. | 5 | — |
| Runs in your browser | 4 | — |
| Works offline after first visit | 5 | — |
| No account needed | 3 | — |
| Generated product illustration: inspect the export, then keep the receipt. | 10 | — |
| THE RECEIPT DESK | 3 | — |
| Open an export to make a receipt | 7 | — |
| Choose a ZIP, JSON, CSV, or text export. | 8 | — |
| Nothing is uploaded. | 3 | — |
| Choose an export | 3 | — |
| ZIP · JSON · CSV · TXT | 4 | — |
| How Export Receipt checks an export | 6 | — |
| Choose | 1 | — |
| Open an export on this device. | 6 | — |
| Inspect | 1 | — |
| Count files, dates, supported categories, attachments, and parse errors. | 9 | — |
| Keep | 1 | — |
| Download and verify a locally signed HTML or JSON receipt. | 10 | — |
| What this does not do | 5 | — |
| It inspects only the export you choose. | 7 | — |
| It does not connect to your service account. | 8 | — |
| Export Receipt checks local exports before access disappears. | 8 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| v1.0.1 | 1 | — |
| An update is ready. | 4 | — |
| Reload | 1 | — |

### README

| Text | Words | Flag |
|---|---:|---|
| Export Receipt | 2 | — |
| Check a data export before access ends. | 7 | — |
| It is for people leaving a service or making a backup. | 11 | — |
| It records files, dates, missing categories, unreadable data, and next checks. | 11 | — |
| The app reads ZIP, JSON, CSV, and text exports in the browser. | 12 | — |
| It hashes your export and parses readable data. | 8 | — |
| It flags unsafe paths and supported missing categories. | 8 | — |
| You can download signed HTML or JSON receipts. | 8 | — |
| Exports are not uploaded. | 4 | — |
| Category checks support Harbor Mail, Google Takeout, and Meta Download exports. | 11 | — |
| If an export matches more than one layout, the receipt says so instead of guessing. | 15 | — |
| Exports must be 50 MB or smaller. | 7 | — |
| ZIPs must contain at most 1,000 entries, expand to 50 MB or less, and stay below 100:1 compression. | 18 | — |
| JSON and CSV files over 20 MB are inventoried but not parsed. | 12 | — |
| Run | 1 | — |
| Requires Node 20 or newer. | 5 | — |
| Open `http://localhost:5173/demo` or `http://localhost:5173/?demo=1` for the isolated sample. | 8 | — |
| It reconstructs sample data in memory and stores nothing. | 9 | — |
| Verify and build | 3 | — |
| Browser tests cover every registered claim. | 6 | — |
| They also check demo isolation, limits, downloads, offline use, keyboard access, route metadata, the 404 page, and both color modes. | 20 | — |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | — |
| Deploy that directory with the included `staticwebapp.config.json`. | 7 | — |
| Privacy | 1 | — |
| Export Receipt has no account, analytics, server API, or export upload. | 11 | — |
| Color mode is the only browser preference it stores outside demo mode. | 12 | — |
| See `/privacy` and `/terms` in the app. | 7 | — |
| It is released under the MIT License. | 7 | — |
| Catalog description | 2 | — |
| Check a data export before access ends with a local receipt of files, dates, categories, and warnings. | 17 | — |

## Demo, privacy, and claims

- **Demo:** one click from the landing page opened `/demo` with a realistic Harbor Mail ZIP already inspected: four files, one attachment, date coverage from 2022-02-19 to 2025-01-08, and **Missing category: Profile**. The persistent banner says **“Demo — sample data, nothing is saved”**, and both **Reset demo** and **Start for real** work.
- **Isolation:** a fresh `/?demo=1` context redirected to `/demo`, had empty localStorage, sessionStorage, and IndexedDB, and remained empty after Reset and Start for real. Changing the color mode in demo did not alter real storage. The full flow made no external request.
- **Offline/privacy:** after the first live `/demo` visit and service-worker activation, an offline reload retained **Your export at a glance** with no console error. Request logging through landing, demo, reset, exit, and inspection observed only `export-receipt.sociobot.in`; no credentials, analytics, or API request was observed.
- **Claims registry:** all 14 entries in `.factory/claims.json` have a matching `@claim:` browser test. In a fresh clone after `npm ci`, every exact registered command passed: `sample-inventory`, `local-only`, `json-receipt`, `html-receipt`, `supported-formats`, `source-hash`, `parse-errors`, `offline-reload`, `account-free`, `preference-storage`, `demo-isolation`, `safe-archive-limits`, `recognized-layouts`, and `receipt-verification`.
- **Unlisted claims:** no unlisted visitor-reliance claim was found on the landing page or README. The testable promises are represented by claim annotations and registry entries; explanatory/legal wording does not make an additional product-performance promise.

## History verification

Read `.factory/review-1.md`, `.factory/polish-1.md`, and the previous handoff. Each earlier finding was confirmed fixed on both the live site and the current code:

| Earlier ID | Confirmation |
|---|---|
| F-1-1 | Fresh one-visit `/demo` service-worker flow reloaded the sample offline. |
| F-1-2 | Demo color changes did not write to real storage; Reset and Start for real retained empty storage. |
| F-1-3 | Direct cold unknown URL returned HTTP 404, rendered the styled receipt-themed page, and had no CSP console error. |
| F-1-4 | `?demo=1` redirected to and loaded `/demo`. |
| F-1-5 | The phone first screen contained the complete action, outcome, and three facts. |
| F-1-6 | Direct `/receipt` rendered **No receipt is open** with real start actions and route metadata. |
| F-1-7 | Root, demo, privacy, terms, receipt, and 404 had route-specific title, description, canonical, Open Graph, and Twitter metadata. |
| F-1-8 | Live/code path names and checks Harbor Mail, Google Takeout, and Meta Download layouts. |
| F-1-9 | The demo supplied local JSON receipt verification for valid and tampered receipts with signer context. |
| F-1-10 | Visitor-facing input terminology is consistently **export**. |
| F-1-11 | The visible color control names the result: **Use dark colors** / **Use light colors**. |
| F-1-12 to F-1-15 | README sentences are now within the 22-word cap and use the revised plain language. |

## Structure and accessibility checks

- Direct cold `/`, `/demo`, `/privacy`, `/terms`, and `/receipt` each returned 200 and the expected route title, one h1, description, canonical, OG/Twitter title, header, main, and footer. Direct `/does-not-exist` returned HTTP 404 with the designed 404 document. Crawled internal non-hash links returned 200.
- Back navigation from Privacy returned to the landing page, focused the landing h1, and restored scroll position. A fresh first Tab reached **Skip to inspection**.
- Live Playwright axe found zero serious or critical issues at 390 px on `/demo` and the direct 404. There were no load console errors. The product has a distinctive neo-brutalist archive-workbench identity matching `.factory/design.md`.
- The mobile header omission in F-2-1 is the only remaining structure issue.

## Missed leverage

No additional AI feature is expected for deterministic, local archive inspection. The clearly implied valuable feature — importing a real export and exporting/verifying a receipt — is present. The implementation contains no provider key or decorative AI control.

## What would make this perfect

Ship the mobile header navigation repair in F-2-1 and its 390 px regression test. Then repeat the fresh-context mobile navigation check. No other change is indicated by this review.
