# Adversarial first-read review 4 — Export Receipt

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against <https://export-receipt.sociobot.in> and repository commit `46b363a8303353504e16a4b12518fa1e26c3f7ad`. The deployed application JavaScript and CSS byte-match a clean build of that commit.

Two blocking claim defects, one major first-screen omission, and two minor copy/accessibility defects remain. PASS requires zero findings and no untested claim.

## Thirty-second cold read

### Phone, 390 × 844, fresh context

- What it does: checks a service data export before access ends and makes a receipt.
- For whom: people leaving a service before their account disappears.
- First click: **Try it with sample data**.

All three answers are visible without scrolling. The action, its result, and the three current facts end at 599 px. The first-read blocking gate therefore passes. F-4-3 records that the three facts do not include the required price fact or an explicit privacy guarantee.

### Desktop, 1440 × 900, fresh context

The same three answers and first action are visible without scrolling. The export-folder illustration and receipt-like typography, rules, stamps, and colors are specific to this product rather than a generic SaaS template.

## Findings

### Blocking

#### F-4-1 / F-1-9 reopened — Receipt verification trusts a replacement key inside the edited receipt

- Exact quote/location: demo verification result, **“Valid signature. This receipt has not changed since this browser signed it.”**; preceding explanation, **“The signer is this local browser, not a trusted service identity.”**; README, **“The app verifies whether a signed JSON receipt changed.”**; `.factory/claims.json` claim `receipt-verification`.
- Evidence: I downloaded the live sample JSON receipt, changed its export name from `harbor-mail-export.zip` to `quality-check-edited.zip`, generated a separate ECDSA P-256 key in an isolated browser check, replaced the receipt's embedded public key, and signed the edited payload. Uploading that file produced **“Valid signature. This receipt has not changed since this browser signed it.”** The key was different and the content had changed. In `src/inspect.ts:163-174`, every download gets a new key pair and verification imports the public key from the same untrusted file; there is no independent key or fingerprint comparison.
- Why this misleads: the verifier proves only that the payload matches whichever public key and signature are bundled with it. It cannot prove that this browser signed the file or that the file was not edited and re-signed. This is the unresolved trust-root concern from earlier F-1-9, not a new cryptographic edge case.
- Concrete fix: either establish an independent trust reference or narrow the promise. One valid design is a persistent non-exportable browser signing key plus a stored trusted public-key fingerprint; verification must reject a receipt whose key does not match. Another is a separately saved verification key/fingerprint that the visitor selects. If no independent reference is added, rename the result to **“The bundled signature matches this receipt”** and add **“This cannot prove who created it or detect editing followed by re-signing.”** Remove **“this browser”** and **“has not changed”**. Add a claim test that edits, re-signs with a replacement key, and must not report an unchanged receipt.

#### F-4-2 — The demo's “source hash” is not a hash of its claimed sample export

- Exact quote/location: demo summary, **“harbor-mail-export.zip”**, **“24.6 KB · SHA-256 1a40bbbbc1eb…”**; `.factory/claims.json` claims `source-hash` and `html-receipt`; README, **“It hashes your export”**.
- Evidence: the downloaded live receipt claims `bytes: 25184` and hash `1a40bbbbc1eb719b3df0f5077fc5ce4d474e1d7a851da784edffb5e973fd6135`. In `src/inspect.ts:148-153`, the sample has four entries but the hash input is only `messages + contacts`: 291 bytes. It omits the 812-byte sample attachment, the 21-byte README, ZIP structure, and every remaining byte implied by the claimed 25,184-byte ZIP. Recomputing SHA-256 over those 291 bytes reproduces the displayed hash exactly. No `harbor-mail-export.zip` byte stream exists in the demo.
- Why this misleads: a receipt presented as evidence labels a digest as the source ZIP's SHA-256 while hashing a different, partial byte stream. The registered `source-hash` test accepts any 12 hex characters after `SHA-256`; the HTML test checks only that the label exists. Neither proves the promised source hash.
- Concrete fix: ship one deterministic sample ZIP and pass its exact bytes through the same `inspectFile()` path used for real exports. Derive its displayed name, byte count, entries, and SHA-256 from that byte array. Change the claim tests to recompute the full 64-character digest from the fixture and compare it with both downloaded receipt formats. The visible summary may remain abbreviated if the full hash is available through a labelled copy/reveal control.

### Major

#### F-4-3 — The first-screen fact row omits price and states privacy indirectly

- Exact quote/location: landing first-screen facts, **“Runs in your browser”**, **“Works offline after first visit”**, and **“No account needed.”**
- Why this matters: the mandatory first-screen shape calls for plain privacy, offline, and price facts. “Runs in your browser” does not tell a visitor whether an upload or API call also occurs, and “No account needed” does not say whether the tool costs money. The explicit **“Nothing is uploaded”** statement appears only below the first screen.
- Concrete fix: use **“Your export stays on this device”**, **“Works offline after first visit”**, and **“Free to use · no account needed”**. Register or extend claims to prove the price statement and keep the existing request-log/account assertions for the other two facts.

### Minor

#### F-4-4 — The skip link names the wrong destination on non-inspection routes

- Exact quote/location: first focusable link on `/privacy`, `/terms`, `/receipt`, and `/demo`, **“Skip to inspection.”** The link targets each route's `#main`.
- Why this matters: a keyboard or screen-reader visitor on a legal page is told that the destination is an inspection even though it is the page's main content. The static 404 uses the different label **“Skip to content.”**
- Concrete fix: use **“Skip to main content”** on every route, including the 404, and retain `href="#main"`. Add a route sweep that checks the common accessible name and target.

#### F-4-5 — The ZIP limit error contradicts the documented and implemented 1,000-entry boundary

- Exact quote/location: README, **“ZIPs must contain at most 1,000 entries”**; runtime error in `src/inspect.ts:114`, **“Choose an export with fewer than 1,000 files…”**; implementation rejects only when `entries > 1_000`.
- Why this matters: “fewer than 1,000” means 999 or fewer, while the product accepts 1,000. It also changes the documented term **entries** to **files**.
- Concrete fix: say **“Choose an export with at most 1,000 entries and at most 50 MB of expanded data.”** Add passing boundary fixtures for exactly 1,000 entries and exactly 50 MB, alongside the existing over-limit fixtures.

## Copy audit

Counting convention: hyphenated terms, URLs, format abbreviations, and version strings count as one word. The landing audit includes navigation, controls, headings, alt text, captions, and hidden update text. Repeated labels are listed by location. No text exceeds 22 words; no banned marketing adjective appears; **export**, **receipt**, **category**, **file**, **finding**, and **sample** are used consistently.

### Landing page

| Text | Words | Flag |
|---|---:|---|
| Skip to inspection | 3 | F-4-4 on non-landing routes |
| EXPORT RECEIPT | 2 | — |
| Demo | 1 | — |
| How it works | 3 | — |
| Privacy (header) | 1 | — |
| Use dark colors / Use light colors | 3 / 3 | — |
| LOCAL EXPORT CHECK | 3 | — |
| Check your export before access ends | 6 | — |
| For people leaving a service, see what your export contains before an account disappears. | 14 | — |
| Try it with sample data | 5 | — |
| Loads a sample receipt now. | 5 | — |
| Runs in your browser | 4 | F-4-3: indirect privacy fact |
| Works offline after first visit | 5 | — |
| No account needed | 3 | F-4-3: does not state price |
| An export folder, magnifier, and printed data receipt on a workbench. | 11 | — |
| Inspect the export, then keep the receipt. | 7 | — |
| CHECK YOUR EXPORT | 3 | — |
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
| Download an HTML receipt, or download and verify a locally signed JSON receipt. | 13 | F-4-1: “verify” overstates the trust result |
| What this does not do | 5 | — |
| It inspects only the export you choose. | 7 | — |
| It does not connect to your service account. | 8 | — |
| Export Receipt checks local exports before access disappears. | 8 | — |
| Privacy (footer) | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| v1.0.1 | 1 | — |
| An update is ready. | 4 | — |
| Reload | 1 | — |

All landing buttons begin with result-naming verbs: **Use**, **Try**, **Choose**, and **Reload**. The finding is the meaning of verification, not the grammatical form of its action.

### README

| Text | Words | Flag |
|---|---:|---|
| Export Receipt | 2 | — |
| Check a data export before access ends. | 7 | — |
| It is for people leaving a service or making a backup. | 11 | — |
| It records files, dates, missing categories, unreadable data, and next checks. | 11 | — |
| The app reads ZIP, JSON, CSV, and text exports in the browser. | 12 | — |
| It hashes your export and parses readable data. | 8 | F-4-2 in the required demo sandbox |
| It flags unsafe paths and supported missing categories. | 8 | — |
| You can download an HTML receipt or a signed JSON receipt. | 11 | — |
| The app verifies whether a signed JSON receipt changed. | 9 | F-4-1: replacement-key receipt passes |
| Exports are not uploaded. | 4 | — |
| Category checks support Harbor Mail, Google Takeout, and Meta Download exports. | 11 | — |
| If an export matches more than one layout, the receipt says so instead of guessing. | 15 | — |
| Exports must be 50 MB or smaller. | 7 | — |
| ZIPs must contain at most 1,000 entries, expand to 50 MB or less, and stay below 100:1 compression. | 18 | F-4-5: runtime error uses a different entry boundary |
| JSON and CSV files over 20 MB are inventoried but not parsed. | 12 | — |
| Run | 1 | — |
| Requires Node 20 or newer. | 5 | — |
| Open `http://localhost:5173/demo` or `http://localhost:5173/?demo=1` for the isolated sample. | 8 | — |
| It reconstructs sample data in memory and stores nothing. | 9 | — |
| Verify and build | 3 | — |
| Browser tests cover every registered claim. | 6 | F-4-1 and F-4-2: commands run, but two tests under-assert their wording |
| They also check demo isolation, Back and Home navigation, limits, downloads, offline use, and keyboard access. | 16 | — |
| Route metadata, the sitemap, the 404 page, and both color modes are checked too. | 14 | — |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | — |
| Deploy that directory with the included `staticwebapp.config.json`. | 7 | — |
| Privacy | 1 | — |
| Export Receipt has no account, analytics, server API, or export upload. | 11 | — |
| Color mode is the only browser preference it stores outside demo mode. | 12 | — |
| See `/privacy` and `/terms` in the app. | 7 | — |
| It is released under the MIT License. | 7 | — |
| Catalog description | 2 | — |
| Check a data export before access ends, then keep a local receipt of files, dates, missing categories, and warnings. | 19 | — |

Proposed README rewrites for the flagged claim sentences until the behavior is corrected:

- **“The demo inventories a reconstructed sample. Real exports are hashed from the file you choose.”**
- **“The verifier checks whether the receipt matches its bundled signature. It does not prove who signed it.”**
- **“Browser tests run each registered claim command.”**

## Demo and sandbox

- One click from the landing page opens `/demo` with an already completed Harbor Mail receipt: four files, two readable data files, one attachment, coverage from 2022-02-19 to 2025-01-08, and **Missing category: Profile**.
- The persistent banner says **“Demo — sample data, nothing is saved.”** Reset reconstructs the visible sample. **Start for real**, browser Back, and the wordmark all remove the sample and banner.
- A real `export-receipt:theme=dark` value was seeded before demo entry. Changing colors, Reset, and exit left real localStorage byte-for-byte unchanged; sessionStorage and IndexedDB remained empty.
- Request logging through landing, demo, Reset, exit, receipt download, and offline reload found only same-origin GETs. There was no analytics, API, credential, export-data, or AI request.
- A fresh one-visit `/demo` reload retained the complete sample while offline. `/?demo=1` normalized to `/demo`.
- The sandbox is behaviorally isolated, but its source-hash evidence is false as F-4-2 records.

## Claims audit

Every exact command in `.factory/claims.json` was run separately after `npm ci` in clean clone `/tmp/export-receipt-review4.EQtzCD/repo` at `46b363a8303353504e16a4b12518fa1e26c3f7ad`.

| Claim | Registered command | Command result | Independent review result |
|---|---|---|---|
| `sample-inventory` | `npm test -- --grep @claim:sample-inventory` | PASS | Proven live and locally |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS | Proven by full-flow request log |
| `json-receipt` | `npm test -- --grep @claim:json-receipt` | PASS | File downloads and its bundled signature verifies |
| `html-receipt` | `npm test -- --grep @claim:html-receipt` | PASS | **Not proven:** sample “source hash” is not its source hash; F-4-2 |
| `supported-formats` | `npm test -- --grep @claim:supported-formats` | PASS | Proven locally |
| `source-hash` | `npm test -- --grep @claim:source-hash` | PASS | **FAIL:** test checks a 12-character pattern, not the source bytes; F-4-2 |
| `parse-errors` | `npm test -- --grep @claim:parse-errors` | PASS | Proven locally |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS | Proven live and locally |
| `account-free` | `npm test -- --grep @claim:account-free` | PASS | Proven live and locally |
| `preference-storage` | `npm test -- --grep @claim:preference-storage` | PASS | Proven locally |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS | Proven live and locally |
| `safe-archive-limits` | `npm test -- --grep @claim:safe-archive-limits` | PASS | Limits pass; F-4-5 is conflicting error copy |
| `recognized-layouts` | `npm test -- --grep @claim:recognized-layouts` | PASS | Proven locally |
| `receipt-verification` | `npm test -- --grep @claim:receipt-verification` | PASS | **FAIL:** replacement key and re-signed edit are accepted; F-4-1 |

All commands exit zero, but the exact claim wording is not proven for `source-hash`, the source-hash part of `html-receipt`, or `receipt-verification`. There are no additional unlisted landing/README capability claims after mapping the remaining statements to the registry. The two under-asserted/failing claims keep the verdict at FAIL.

## Earlier finding verification

Every earlier review, polish record, verification record, and the previous handoff was read. Each earlier finding was checked against both the live site and current source.

| Earlier ID | Current confirmation |
|---|---|
| F-1-1 | Fixed: a fresh one-visit `/demo` retained the full receipt after offline reload. |
| F-1-2 | Fixed: demo color changes, Reset, Start for real, Back, and Home preserved seeded real storage. |
| F-1-3 | Fixed: a cold unknown URL returned HTTP 404 with the designed, CSP-clean page and shared navigation. |
| F-1-4 | Fixed: `/?demo=1` normalized to `/demo` and loaded the sample. |
| F-1-5 | Fixed: the action, outcome, and fact row end at 599 px on 390 × 844. F-4-3 concerns the facts' content, not their geometry. |
| F-1-6 | Fixed: direct `/receipt` shows the route-specific empty state and actions. |
| F-1-7 | Fixed: all SPA routes and the 404 expose route-specific rendered title, description, canonical, OG, and Twitter metadata. |
| F-1-8 | Fixed: Harbor Mail, Google Takeout, and Meta Download have positive, missing, ambiguous, and non-match fixtures. |
| F-1-9 | **Reopened as F-4-1:** a verifier now exists, but it still has no independent trust root and accepts a modified, replacement-key receipt. |
| F-1-10 | Fixed: visitor-facing input terminology consistently uses **export**. |
| F-1-11 | Fixed: the visible controls say **Use dark colors** and **Use light colors**. |
| F-1-12–F-1-15 | Fixed for length and jargon: all current README sentences are at most 22 words. Claim-coverage accuracy regressed under F-4-1/F-4-2. |
| F-2-1 | Fixed: mobile header **Demo** and **Privacy** links are visible 44 px targets. |
| F-3-1 | Fixed: demo Back and wordmark Home leave `/demo`, discard the sample, and focus the landing h1. |
| F-3-2 | Fixed: `/receipt` is present in the sitemap, which matches all five SPA routes. |
| F-3-3 | Fixed: the section label is **CHECK YOUR EXPORT**. |
| F-3-4 | Fixed: the Terms h1 is **Terms for using Export Receipt**. |
| F-3-5 | Fixed: Privacy links to the repository issues page, labels the new tab, and the destination returned 200. |
| F-3-6 | Fixed: the caption is **Inspect the export, then keep the receipt.** |

Earlier verification defects for large JSON, multiline CSV, valid dates, readable counts, layout inspectors, archive bounds, accessibility contrast/targets, 404 status, immutable assets, headers, and initial keyboard focus remain fixed. The original unsigned-receipt defect evolved into F-1-9; the current file is cryptographically signed, but F-4-1 shows why the verifier's stronger unchanged/browser-origin statement remains false.

## Structure, links, accessibility, and quality gates

- Direct cold `/`, `/demo`, `/privacy`, `/terms`, and `/receipt` requests returned 200. A fresh unknown URL returned the designed 404 with HTTP 404.
- Each rendered route has the expected title, one h1, description, canonical, OG/Twitter metadata, header, main, and footer. Root title is **“Export Receipt — Check your data export.”**
- Every discovered internal link and asset returned 200. The disclosed external repository issues link returned 200. The favicon, Apple icon, manifest, robots file, sitemap, and 1200 × 630 product-specific social card are present.
- A fresh first Tab reaches the skip link. Client route changes focus the new h1. Back from a deep landing position restored scroll to 1,308 px and focus to the landing h1; Forward restored the Privacy route and h1 focus. F-4-4 is the skip link's inaccurate name on non-inspection routes.
- Live axe found zero violations at 390 px on `/`, `/demo`, `/privacy`, `/terms`, `/receipt`, and the direct 404. The production browser suite passed both color modes, 44 px targets, keyboard checks, and reduced motion. No unexpected console error was observed.
- The neo-brutalist archive-workbench identity matches `.factory/design.md` and is visually distinct. The app JavaScript is 24.01 kB raw / 9.23 kB gzip; CSS is 11.82 kB raw / 3.48 kB gzip.
- Clean-clone `npm test`, `npm run lint`, `npm run build`, and `npm audit --omit=dev` all passed. The build produced `dist/`; eight unit tests and the full production-browser suite passed.

## Missed leverage

No AI feature is warranted for deterministic local archive inspection, and no provider key or decorative AI feature is present. The expected import/export loop already exists: open a real export, inspect it, download HTML or JSON, and check a JSON signature. Sync would conflict with the stated local-only purpose. The valuable missing piece is trustworthy receipt verification, described concretely in F-4-1, not AI.

## What would make this perfect

Give receipt verification an independent trust reference or narrow its result to what the bundled signature proves. Build the demo from one real shipped ZIP so its byte count and full SHA-256 are genuine. Put explicit privacy and price facts on the first screen, standardize the skip link as **“Skip to main content,”** and make the ZIP boundary error say **“at most 1,000 entries.”** Add the adversarial replacement-key, exact sample-digest, route skip-label, price/privacy, and exact-boundary regression tests, then repeat the clean live review. Until all five findings are closed, there is still work left to do.
