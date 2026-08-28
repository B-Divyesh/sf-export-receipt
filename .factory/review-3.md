# Adversarial first-read review 3 — Export Receipt

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against <https://export-receipt.sociobot.in> and repository commit `5bd4884473ca8dec431b91c11e26a877aad30b77`. The deployed JavaScript, CSS, and hero image byte-match a clean build of that commit. This was a full review, not a diff review.

Two blocking findings and five minor findings remain. PASS requires zero findings and no untested claim.

## Thirty-second cold read

### Phone, 390 × 844, fresh context

- What it does: checks a service data export before access ends and makes a receipt.
- For whom: people leaving a service before their account disappears.
- First click: **Try it with sample data**.

All three answers are visible without scrolling. The action ends at y=453. The result text and all three facts end at y=599, inside the 844 px viewport. The repaired **Demo** and **Privacy** header links are visible 44 px targets.

### Desktop, 1440 × 900, fresh context

The same three answers are visible without scrolling. The action ends at y=684, and the facts end at y=761. The archive-workbench image and receipt-like rules, stamps, colors, and typography are specific to this product rather than a generic SaaS layout.

## Findings

### Blocking

#### F-3-1 — Demo mode breaks browser Back and the wordmark home link

- Exact location: enter the live demo from `/`, then use browser Back; or activate the **EXPORT RECEIPT** wordmark on `/demo`.
- Evidence: both actions leave the URL at `/demo`, keep the **Your export at a glance** h1, and keep the demo banner. In code, `demo` remains true and `render()` rewrites `/` back to `/demo` (`src/main.ts:75`). The suite checks Back from Privacy but never checks Back or Home from the demo.
- Why this blocks: the required wordmark-to-home contract and browser history are broken on the product's primary try-out path. A visitor cannot use either standard navigation route to leave the demo; only **Start for real** works.
- Concrete fix: derive demo state from the destination or clear `demo` when routing to `/`. Do not rewrite a genuine popstate to `/demo`. Add a 390 px test that enters the demo from `/`, presses Back, and confirms `/`, the landing h1, restored focus, and no demo banner. Add the same assertions after activating the wordmark from `/demo`.

#### F-1-9 — Reopened: the HTML verification promise remains half-fixed

- Exact quote/location: landing **How it works**, **“Download and verify a locally signed HTML or JSON receipt.”** The demo offers **Download signed HTML receipt**, but the verifier is titled **Verify a signed JSON receipt** and accepts only `application/json,.json`.
- Evidence: the live HTML download includes a signature value but no public key. The product therefore cannot verify that HTML receipt. `receipt-verification` promises and tests JSON only. `html-receipt` passes by checking for the strings **Signed by:** and **Signature:**; it never verifies the signature. This is the unresolved HTML half of earlier F-1-9, while the new landing copy makes the promise broader.
- Why this blocks: a visitor is explicitly told that either output can be verified. One of the two cannot be verified in the product or independently from the downloaded file, and no registered test proves that statement.
- Concrete fix: either change the sentence to **“Download an HTML receipt, or download and verify a locally signed JSON receipt.”** and remove **signed** from the HTML action/claim, or include the verification material and add an HTML import verifier. In the latter case, change `@claim:html-receipt` to verify an unchanged HTML receipt and reject a tampered one.

### Minor

#### F-3-2 — The sitemap omits a real route

- Exact location: live and repository `sitemap.xml` list `/`, `/demo`, `/privacy`, and `/terms`, but omit `/receipt`.
- Why this fails: the site-structure contract requires every route in the sitemap. `/receipt` is a direct, designed empty-state route with its own title and canonical.
- Concrete fix: add `https://export-receipt.sociobot.in/receipt` and add a test that compares the declared SPA routes with sitemap entries.

#### F-3-3 — “THE RECEIPT DESK” is decorative metaphor copy

- Exact quote/location: landing section label above **Open an export to make a receipt**, **“THE RECEIPT DESK”**.
- Why this fails: “desk” does not name a product section or give the visitor usable information. It is brand mood that could label unrelated products.
- Concrete fix: remove the label, or replace it with **“CHECK YOUR EXPORT”**.

#### F-3-4 — The Terms h1 is a mood line, not a page heading

- Exact quote/location: `/terms` h1, **“Use Export Receipt at your own pace”**.
- Why this fails: heard out of context, it does not identify terms or explain the page. “At your own pace” supplies mood rather than information.
- Concrete fix: use **“Terms for using Export Receipt”**.

#### F-3-5 — The privacy page gives an unavailable contact direction

- Exact quote/location: `/privacy`, under **Questions**, **“Contact the Param Factory through its product listing.”** There is no link or contact address in that section or footer.
- Why this fails: the sentence instructs a visitor to use a destination the page does not provide.
- Concrete fix: make **product listing** a working, crawled link to the Export Receipt listing, or provide a verified contact link directly.

#### F-3-6 — The illustration caption starts with an internal production note

- Exact quote/location: landing hero caption, **“Generated product illustration: inspect the export, then keep the receipt.”**
- Why this fails: “Generated product illustration” describes how an asset was made, not information a visitor can use. Provenance belongs in `.factory/design.md`, where it is already recorded.
- Concrete fix: use **“Inspect the export, then keep the receipt.”** or remove the visible caption while retaining the useful image alt text.

## Copy audit

Counting convention: hyphenated terms, URLs, code spans, format abbreviations, and version strings count as one word. The audit includes headings, labels, actions, alt/caption text, footer text, and the hidden update message. No sentence exceeds 22 words, no banned marketing adjective appears, and visitor-facing input terminology consistently uses **export**. Flags are F-3-3, F-3-4, F-3-5, F-3-6, and the verification wording in reopened F-1-9.

### Landing page

| Text | Words | Flag |
|---|---:|---|
| Skip to inspection | 3 | — |
| EXPORT RECEIPT | 2 | — |
| Demo | 1 | — |
| How it works | 3 | — |
| Privacy | 1 | — |
| Use dark colors | 3 | — |
| LOCAL EXPORT CHECK | 3 | — |
| Check your export before access ends | 6 | — |
| For people leaving a service, see what your export contains before an account disappears. | 14 | — |
| Try it with sample data | 5 | — |
| Loads a sample receipt now. | 5 | — |
| Runs in your browser | 4 | — |
| Works offline after first visit | 5 | — |
| No account needed | 3 | — |
| An export folder, magnifier, and printed data receipt on a workbench. | 11 | — |
| Generated product illustration: inspect the export, then keep the receipt. | 10 | F-3-6: internal production note |
| THE RECEIPT DESK | 3 | F-3-3: decorative metaphor |
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
| Download and verify a locally signed HTML or JSON receipt. | 10 | F-1-9: HTML cannot be verified |
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
| You can download signed HTML or JSON receipts. | 8 | F-1-9: HTML signature is not verifiable |
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
| Browser tests cover every registered claim. | 6 | F-1-9: the HTML test does not prove the visitor-facing verification promise |
| They also check demo isolation, limits, downloads, offline use, keyboard access, route metadata, the 404 page, and both color modes. | 20 | F-3-1: Back/Home from demo is not checked |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | — |
| Deploy that directory with the included `staticwebapp.config.json`. | 7 | — |
| Privacy | 1 | — |
| Export Receipt has no account, analytics, server API, or export upload. | 11 | — |
| Color mode is the only browser preference it stores outside demo mode. | 12 | — |
| See `/privacy` and `/terms` in the app. | 7 | — |
| It is released under the MIT License. | 7 | — |
| Catalog description | 2 | — |
| Check a data export before access ends with a local receipt of files, dates, categories, and warnings. | 17 | — |

### Other page copy flags

| Text | Words | Flag |
|---|---:|---|
| Use Export Receipt at your own pace | 7 | F-3-4: Terms h1 does not name the page |
| Contact the Param Factory through its product listing. | 8 | F-3-5: no destination is provided |

## Demo and sandbox

- One click from the landing page opens `/demo` with a completed, realistic Harbor Mail receipt: four files, two readable data files, one attachment, coverage from 2022-02-19 to 2025-01-08, and **Missing category: Profile**.
- The persistent banner says **Demo — sample data, nothing is saved**. Reset reconstructs identical receipt text. **Start for real** removes the banner, returns to `/`, and exposes the real picker.
- A real `export-receipt:theme=dark` preference was seeded before demo entry. Changing colors, Reset, and Start for real left localStorage byte-for-byte unchanged; sessionStorage and IndexedDB stayed empty.
- The full live flow made only same-origin requests. There was no analytics, API, credential, or export-data request.
- A fresh direct `/?demo=1` opened `/demo`. A fresh one-visit `/demo` remained complete after the context went offline and reloaded.
- Demo exit through the explicit button passes. Standard Back and wordmark exit fail as F-3-1 records.

## Claims audit

Every exact command in `.factory/claims.json` was run separately after `npm ci` in clean clone `/tmp/export-receipt-review3-clean/repo` at `5bd4884473ca8dec431b91c11e26a877aad30b77`.

| Claim | Registered command | Command result | Review result |
|---|---|---|---|
| sample-inventory | `npm test -- --grep @claim:sample-inventory` | PASS | Proven live and locally |
| local-only | `npm test -- --grep @claim:local-only` | PASS | Proven live and locally |
| json-receipt | `npm test -- --grep @claim:json-receipt` | PASS | Proven locally |
| html-receipt | `npm test -- --grep @claim:html-receipt` | PASS | Test only checks signature text; F-1-9 |
| supported-formats | `npm test -- --grep @claim:supported-formats` | PASS | Proven locally |
| source-hash | `npm test -- --grep @claim:source-hash` | PASS | Proven locally |
| parse-errors | `npm test -- --grep @claim:parse-errors` | PASS | Proven locally |
| offline-reload | `npm test -- --grep @claim:offline-reload` | PASS | Proven live and locally |
| account-free | `npm test -- --grep @claim:account-free` | PASS | Proven live and locally |
| preference-storage | `npm test -- --grep @claim:preference-storage` | PASS | Proven live and locally |
| demo-isolation | `npm test -- --grep @claim:demo-isolation` | PASS | Proven live and locally |
| safe-archive-limits | `npm test -- --grep @claim:safe-archive-limits` | PASS | Proven locally |
| recognized-layouts | `npm test -- --grep @claim:recognized-layouts` | PASS | Proven locally |
| receipt-verification | `npm test -- --grep @claim:receipt-verification` | PASS | JSON only; does not cover the HTML wording |

No command failed. The landing's HTML-verification promise is not represented by a claim and is not proven by either relevant test; this is the unlisted/under-tested claim in F-1-9. Other product-capability sentences on the landing page and README map to the registry.

The full clean-clone `npm test` also passed: 8 unit tests and all production-browser checks. `npm run lint` and `npm run build` passed. The app bundle is 23.62 kB raw / 9.06 kB gzip, and the CSS is 11.61 kB raw / 3.44 kB gzip.

## Earlier finding verification

All earlier review, polish, and handoff documents were read. Each earlier finding was checked on the live site and in current code rather than accepted from its status label.

| Earlier ID | Current confirmation |
|---|---|
| F-1-1 | Fixed: a fresh one-visit `/demo` reload retained the sample while offline. |
| F-1-2 | Fixed: demo color changes, Reset, and exit preserved seeded real storage exactly. |
| F-1-3 | Fixed: a fresh direct unknown URL returned HTTP 404 with the designed receipt-style page and shared navigation. |
| F-1-4 | Fixed: `/?demo=1` opened `/demo` with the sample and banner. |
| F-1-5 | Fixed: at 390 × 844 the complete action, result, and three facts end at y=599. |
| F-1-6 | Fixed: direct `/receipt` shows the route-specific **No receipt is open** state. |
| F-1-7 | Fixed in the rendered SPA and static 404: title, description, canonical, OG, Twitter, and favicon metadata are present and route-specific. |
| F-1-8 | Fixed: README and browser fixtures name and exercise Harbor Mail, Google Takeout, and Meta Download. |
| F-1-9 | **Reopened, blocking:** JSON verification exists, but the current HTML-or-JSON verification sentence is not true for HTML. |
| F-1-10 | Fixed: visitor-facing input terminology consistently uses **export**. |
| F-1-11 | Fixed: the visible control says **Use dark colors** or **Use light colors**. |
| F-1-12 | Fixed: README audience copy is split into 11-word sentences. |
| F-1-13 | Fixed: feature copy is split and named-layout coverage is registered. |
| F-1-14 | Fixed: safety-limit sentences are at or below 18 words. |
| F-1-15 | Fixed as sentence length: test-coverage sentences are 6 and 20 words. Their uncovered behaviors are recorded in F-1-9 and F-3-1. |
| F-2-1 | Fixed: 390 px headers expose working 44 px **Demo** and **Privacy** links. |

## Structure, links, and accessibility

- Fresh direct `/`, `/demo`, `/privacy`, `/terms`, and `/receipt` requests return 200. A fresh unknown path returns 404 with a designed page. Every page has `lang="en"`, one h1, one main, a header/footer, route title, description, canonical, OG/Twitter metadata, favicon, and product-specific presentation.
- Every actual internal link crawled from the site returned 200. The favicon, social card, manifest, robots file, and sitemap also returned 200.
- Client-side navigation moves focus to the new h1. Privacy navigation and Back restore focus and scroll. Demo Back/Home fail as F-3-1 records.
- Live axe checks at 390 px found zero violations on `/`, `/demo`, `/privacy`, `/terms`, `/receipt`, and the direct 404. Light and dark landing/demo checks also found zero violations. The factory URL verifier reported one h1, `lang`, `main`, complete image alt text, and no root-page console errors.
- The 1200 × 630 social card, SVG favicon, Apple icon, service worker, reduced-motion rule, CSP/security headers, and designed 404 are present. The sitemap omission is F-3-2.

## Missed leverage

No AI feature is warranted for deterministic, local archive inspection. Importing exports, downloading receipts, and local JSON verification cover the obvious workflow. The incomplete HTML verification is a correctness gap, not a reason to add AI, sync, or a provider key. No runtime AI key or provider endpoint is present.

## What would make this perfect

Fix demo Back and wordmark navigation; either make HTML receipts verifiable or state plainly that only JSON is verifiable; add `/receipt` to the sitemap; replace the Terms h1; remove or replace the decorative landing labels; and provide a real privacy contact destination. Add regression tests for every change, then repeat the fresh live review. Until all seven findings are closed, there is still work left to do.
