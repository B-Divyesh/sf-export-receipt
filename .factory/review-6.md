# Adversarial first-read review 6 — Export Receipt

**Verdict: PASS**

Reviewed 2026-08-28 UTC against <https://export-receipt.sociobot.in> and repository commit `42f5ed89af26202b7c0a7414d5bf2e21d78a8a90`. This was a fresh-browser, phone-first review from scratch. The live deployment serves the same named JavaScript, CSS, worker, and hero assets produced by the clean build.

There are zero findings, zero untested claims, and no reopened historical finding.

## Thirty-second cold read

### Phone, 390 × 844

- What it does: checks a service export before access ends.
- For whom: people leaving a service before an account disappears.
- First click: **Try it with sample data**.

The exact first-screen copy is **“Check your export before access ends”**, **“For people leaving a service, see what your export contains before an account disappears.”**, and **“Try it with sample data”**. The action outcome, **“Loads a sample receipt now.”**, and the privacy, offline, and price facts are all visible without scrolling. The facts end at 599 px in the 844 px viewport.

### Desktop, 1440 × 900

The same three answers, the action outcome, and all three facts are visible without scrolling. The archive folder, magnifier, receipt strip, paper ground, hard ink rules, and lime/orange/blue accents match `.factory/design.md`. This does not resemble a generic centered SaaS hero or feature-card template.

## Findings

None.

## Copy audit

Counts treat hyphenated terms, URLs, format names, and version strings as one word. Punctuation-only separators are not words. The tables include headings, controls, alt text, captions, and conditional update copy so that heading and action checks are explicit. README code commands are not sentences and are excluded.

No item exceeds 22 words. No banned marketing adjective, unexplained slogan, mood heading, inconsistent term, or non-result-naming control was found.

### Landing page

| Copy item | Words | Result |
|---|---:|---|
| Skip to main content | 4 | pass |
| EXPORT RECEIPT | 2 | pass |
| Demo | 1 | pass |
| How it works | 3 | pass |
| Privacy (header and footer) | 1 each | pass |
| Use dark colors / Use light colors | 3 / 3 | pass |
| LOCAL EXPORT CHECK | 3 | pass |
| Check your export before access ends | 6 | pass |
| For people leaving a service, see what your export contains before an account disappears. | 14 | pass |
| Try it with sample data | 5 | pass |
| Loads a sample receipt now. | 5 | pass |
| Your export stays on this device | 6 | pass |
| Works offline after first visit | 5 | pass |
| Free to use · no account needed | 6 | pass |
| An export folder, magnifier, and printed data receipt on a workbench. | 11 | pass |
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
| v1.0.3 | 1 | pass |
| An update is ready. | 4 | pass |
| Reload | 1 | pass |

### README

| Sentence or heading | Words | Result |
|---|---:|---|
| Export Receipt | 2 | pass |
| Check a data export before access ends. | 7 | pass |
| It is for people leaving a service or making a backup. | 11 | pass |
| It records files, dates, missing categories, unreadable data, and next checks. | 11 | pass |
| The app reads ZIP, JSON, CSV, and text exports in the browser. | 12 | pass |
| It hashes the complete export and parses readable data. | 9 | pass |
| It flags unsafe paths and supported missing categories. | 8 | pass |
| You can download an HTML receipt or a signed JSON receipt. | 11 | pass |
| The app checks a JSON receipt against its bundled signature. | 10 | pass |
| This check cannot identify its signer or detect editing followed by re-signing. | 12 | pass |
| Exports are not uploaded. | 4 | pass |
| Export Receipt is free to use without an account. | 9 | pass |
| Category checks support Harbor Mail, Google Takeout, and Meta Download exports. | 11 | pass |
| If an export matches more than one layout, the receipt says so instead of guessing. | 15 | pass |
| Exports must be 50 MB or smaller. | 7 | pass |
| ZIPs must contain at most 1,000 entries, expand to 50 MB or less, and stay below 100:1 compression. | 18 | pass |
| JSON and CSV files over 20 MB are inventoried but not parsed. | 12 | pass |
| Run | 1 | pass |
| Requires Node 20 or newer. | 5 | pass |
| Open `http://localhost:5173/demo` or `http://localhost:5173/?demo=1` for the isolated sample. | 8 | pass |
| It inspects the shipped Harbor Mail ZIP in memory and stores nothing. | 12 | pass |
| Verify and build | 3 | pass |
| Browser tests cover every registered claim. | 6 | pass |
| They also check demo isolation, Back and Home navigation, limits, downloads, offline use, and keyboard access. | 16 | pass |
| Route metadata, the sitemap, the 404 page, and both color modes are checked too. | 14 | pass |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | pass |
| Deploy that directory with the included `staticwebapp.config.json`. | 7 | pass |
| Privacy | 1 | pass |
| Export Receipt has no account, analytics, server API, or export upload. | 11 | pass |
| Color mode is the only browser preference it stores outside demo mode. | 12 | pass |
| See `/privacy` and `/terms` in the app. | 7 | pass |
| It is released under the MIT License. | 7 | pass |
| Catalog description | 2 | pass |
| Check a service export before access ends and save a local receipt of files, dates, gaps, and warnings. | 18 | pass |

### Terminology

| Concept | Term used |
|---|---|
| User-selected input | export |
| Item contained in an export | file |
| Saved inspection result | receipt |
| Recognized service grouping | category / layout |
| Isolated try-out | demo / sample data |

The terms do not conflict: **layout** names the detected export structure, while **category** names an expected content group within that layout.

## Demo and sandbox

- The landing action opens `/demo` in one click and focuses **Your export at a glance**.
- The first completed screen already shows a realistic Harbor Mail export: four files, two parsed data files, one attachment, coverage from 2022-02-19 to 2025-01-08, and **Missing category: Profile**.
- The persistent banner says **“Demo — sample data, nothing is saved”** and exposes **Reset demo** and **Start for real**.
- Reset reproduces the exact sample. Start for real, browser Back, and the wordmark return to `/`, remove the sample/banner, and focus the landing h1.
- A real dark-color preference was seeded before demo entry. Changing color in the demo, resetting, and exiting left localStorage, sessionStorage, IndexedDB, cookies, and the seeded real value unchanged.
- `/?demo=1` normalizes to `/demo` and behaves identically.
- The request log contained only same-origin GETs for the document and static assets. It contained no upload, API, analytics, credential, fetch/XHR, WebSocket, or cross-origin request.
- After one online `/demo` visit and service-worker activation, an offline reload restored the complete four-file receipt.

## Claims audit

Every exact command from `.factory/claims.json` ran separately after `npm ci` in fresh clone `/tmp/export-receipt-review6.hQJ186/repo` at commit `42f5ed89af26202b7c0a7414d5bf2e21d78a8a90`.

| Claim ID | Exact command | Result | Observable evidence |
|---|---|---|---|
| `sample-inventory` | `npm test -- --grep @claim:sample-inventory` | PASS | Four files, attachment, date coverage, and missing Profile category appear at 390 px. |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS | Fixture inspection produced no upload, API, or cross-origin request. |
| `json-receipt` | `npm test -- --grep @claim:json-receipt` | PASS | Downloaded JSON contains next checks and a WebCrypto-verifiable signature. |
| `html-receipt` | `npm test -- --grep @claim:html-receipt` | PASS | Downloaded HTML contains the exact source digest, findings, and checklist. |
| `supported-formats` | `npm test -- --grep @claim:supported-formats` | PASS | ZIP, JSON, CSV, and text fixtures each produce a completed receipt. |
| `source-hash` | `npm test -- --grep @claim:source-hash` | PASS | UI and JSON digest equal SHA-256 over every byte of the shipped 869-byte ZIP. |
| `parse-errors` | `npm test -- --grep @claim:parse-errors` | PASS | Malformed JSON produces the promised parse-error finding. |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS | The complete demo reloads offline after its first visit. |
| `account-free` | `npm test -- --grep @claim:account-free` | PASS | Real and demo flows expose no account, payment, analytics, cookie, or API control/traffic. |
| `preference-storage` | `npm test -- --grep @claim:preference-storage` | PASS | Only `export-receipt:theme` is stored outside demo mode and survives reload. |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS | Reset, exit, Back, Home, and color changes leave real storage unchanged. |
| `safe-archive-limits` | `npm test -- --grep @claim:safe-archive-limits` | PASS | Unsafe path, source, entry, expansion, ratio, and text-size fixtures produce the documented outcomes. |
| `recognized-layouts` | `npm test -- --grep @claim:recognized-layouts` | PASS | Harbor Mail, Google Takeout, and Meta Download positive, missing, ambiguous, and non-match fixtures pass. |
| `receipt-verification` | `npm test -- --grep @claim:receipt-verification` | PASS | Valid, tampered, and replacement-key re-signed receipts receive the narrowly accurate bundled-signature results. |

The full clean-clone `npm test`, `npm run lint`, and `npm run build` also pass. The build produces `dist/`; app JavaScript is 25.02 kB raw and 10.06 kB gzip.

All live and README capability statements map to these claims. Privacy-page storage and network statements map to `local-only`, `account-free`, `preference-storage`, and `demo-isolation`. The receipt wording maps to the download, hash, and verification claims. No unlisted claim or under-asserted registered claim remains.

## Structure, links, and accessibility

- `/`, `/demo`, `/privacy`, `/terms`, and `/receipt` return 200. A cold unknown route and an unknown route after service-worker activation both return HTTP 404 with the designed receipt-style page.
- Titles are route-specific: **Export Receipt — Check your data export**, **Demo — Export Receipt**, **Privacy — Export Receipt**, **Terms — Export Receipt**, **No receipt is open — Export Receipt**, and **Page not found — Export Receipt**.
- Each checked route has `lang="en"`, one h1, one main landmark, ordered headings, a description, canonical URL, Open Graph/Twitter metadata, favicon, consistent navigation/footer, and **Skip to main content**.
- The sitemap exactly covers the five application routes. `robots.txt` publishes it. The 1200 × 630 product-specific social card, manifest, SVG favicon, and Apple icon return 200.
- All non-fragment destinations crawled from every route and the 404 return 200. Same-page fragments resolve to existing targets, and the disclosed GitHub issues link returns 200.
- Client navigation and Back focus the destination h1 and restore landing scroll. Mobile Demo and Privacy controls are visible 44 px targets.
- Playwright axe reports zero serious or critical violations across all five application routes and the 404 at 390 px. Both color modes, keyboard start, horizontal overflow, and reduced motion pass. No unexpected console error occurs.
- The CSP, `X-Content-Type-Options`, and `Referrer-Policy` response headers are present and match loaded resources.

## Earlier findings rechecked

Every prior review, polish record, and handoff was read. Each finding was checked against both current code and live behavior.

| Earlier ID | Live and code confirmation |
|---|---|
| F-1-1 | The worker precaches the app shell for declared routes; one `/demo` visit is enough for a complete offline reload. |
| F-1-2 | Demo theme changes are memory-only; Reset and every exit preserve seeded real storage exactly. |
| F-1-3 | The static 404 uses same-origin `status.css`, shared structure, correct metadata, no CSP error, and HTTP 404. |
| F-1-4 | `?demo=1` is normalized to `/demo` and loads the same isolated sample. |
| F-1-5 | At 390 × 844 the action, outcome, and three facts end at 599 px. |
| F-1-6 | Direct `/receipt` shows the titled **No receipt is open** state with real and sample actions. |
| F-1-7 | All application routes and the 404 expose route-specific title, description, canonical, OG, and Twitter metadata. |
| F-1-8 | The registry and fixtures cover Harbor Mail, Google Takeout, and Meta Download recognition and ambiguity. |
| F-1-9 | HTML is plainly unsigned; JSON checking is available and limited to what the bundled signature proves. |
| F-1-10 | **Export** is the input term; **file** is reserved for items or format instructions. |
| F-1-11 | The color control says **Use dark colors** or **Use light colors**. |
| F-1-12 | The README audience copy remains split into 11-word sentences. |
| F-1-13 | README feature statements remain short and mapped to registered claims. |
| F-1-14 | README source, entry, expansion, ratio, and text limits remain short and exact. |
| F-1-15 | README test coverage remains short, plain, and accurate against the full passing suite. |
| F-2-1 | Mobile headers retain visible, working, 44 px Demo and Privacy links. |
| F-3-1 | Demo Back and wordmark Home leave `/demo`, discard the sample, restore real preference state, and focus the landing h1. |
| F-3-2 | `/receipt` is in `sitemap.xml`; the sitemap matches all declared SPA routes. |
| F-3-3 | The task label is **CHECK YOUR EXPORT**, not the former metaphor. |
| F-3-4 | The Terms h1 is **Terms for using Export Receipt**. |
| F-3-5 | Privacy provides a named repository issues link; its destination returns 200 and new-tab behavior is disclosed. |
| F-3-6 | The caption is the useful **Inspect the export, then keep the receipt.** Provenance remains in `.factory/design.md`. |
| F-4-1 | Verification never claims browser identity or unchanged history; replacement-key re-signing is disclosed and tested. |
| F-4-2 | The demo uses the exact shipped 869-byte ZIP; its full digest matches UI, JSON, and HTML. |
| F-4-3 | The first screen states device privacy, offline availability, and free/no-account use directly. |
| F-4-4 | Every application and status page uses **Skip to main content** targeting `#main`. |
| F-4-5 | Runtime and README both say **at most 1,000 entries** and **at most 50 MB**; exact boundaries pass. |
| F-5-1 | The worker serves its shell only for declared routes; unknown controlled navigations reach a true HTTP 404. |

## Missed leverage

No additional feature is implied strongly enough to be missing. Real ZIP/JSON/CSV/text import, a one-click isolated sample, HTML/JSON export, and local JSON-signature checking complete the expected workflow. Sync would contradict the local-only purpose. AI would add network, key, cost, and privacy complexity to a deterministic inspection task without improving the core job. No decorative AI feature or provider key is present.

## What would make this perfect

Nothing remains to change under this review. Preserve the current claim tests, controlled-PWA 404 regression, demo-isolation checks, copy cap, and route/accessibility sweep in future releases.
