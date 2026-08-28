# Adversarial first-read review 1 — Export Receipt

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against live <https://export-receipt.sociobot.in> and commit `3bd397e6c7d2c5f06925cde8e246ef801be2c74e`. The live shell, worker, JavaScript, CSS, and hero asset byte-match a clean build of that commit.

There are three blocking findings, twelve additional findings, and two visitor-facing behaviors without adequate claim coverage. This cannot pass under the required zero-finding standard.

## Thirty-second cold read

### Desktop, 1440 × 900

- What it does: checks a service data export before access ends.
- For whom: people leaving a service or about to lose an account.
- First click: **Try it with sample data**.

All three answers are visible without scrolling. The adjacent result text and the three short facts are also visible.

### Phone, 390 × 844

- What it does: checks a service data export before access ends.
- For whom: people leaving a service or about to lose an account.
- First click: **Try it with sample data**.

The three questions can just be answered, so this specific gate passes. The button begins at 820 px and extends below the 844 px viewport. **“Loads a sample receipt now.”** and all three facts are below the fold. This is recorded as F-1-5.

## Findings

### Blocking

#### F-1-1 — “Works offline after first visit” fails on the clean demo path

- Exact quote/location: landing fact, **“Works offline after first visit”**; `.factory/claims.json` claim `offline-reload`.
- Evidence: in a fresh browser context, `/demo` loaded the complete sample. After the service worker became active and controlled the page, the context was taken offline and reloaded. The result was **“You are offline. The app shell will work after a first visit. Reconnect once, then try the archive again.”**, not the sample receipt.
- Why this misleads: the declared claim says one visit is enough. The registered test inserts an additional online `page.reload()` before going offline, which runtime-caches `/demo` and avoids the first-visit failure.
- Concrete fix: make navigation requests such as `/demo` fall back to the precached `index.html`. Change the claim test to load `/demo` once, wait for service-worker control/cache completion without another navigation, go offline, reload, and assert the sample receipt rather than the offline page.

#### F-1-2 — Demo mode writes to real storage while saying nothing is saved

- Exact quote/location: demo banner, **“Demo — sample data, nothing is saved”**; visible **“Dark”** theme control; `.factory/claims.json` claim `demo-isolation`.
- Evidence: a clean `/demo` context began with empty storage. Activating the theme control wrote `localStorage["export-receipt:theme"] = "dark"`. **Reset demo** left that real preference in place.
- Why this misleads: the review contract says nothing done in demo mode may persist to the real namespace. The current demo-isolation test never exercises the global theme control, so it does not prove the banner.
- Concrete fix: keep theme changes in memory while demo mode is active, or use a `demo:` namespace that is deleted by Reset and Start for real. Seed a real preference before entering demo, exercise every demo control, then assert byte-for-byte unchanged real storage after Reset and exit.

#### F-1-3 — The HTTP 404 is visually broken by its own CSP

- Exact quote/location: unknown route `/does-not-exist`; console error **“Applying inline style violates … style-src 'self'”**.
- Evidence: the server correctly returns HTTP 404, but `public/404.html` puts all styling in an inline `<style>`. The global CSP blocks it. The live result is an unstyled serif **“NOT FOUND”** page with a 17 px-high link, no product header/footer, no skip link, and no product visual system.
- Why this fails: the required designed 404 is not delivered, its control misses the 44 px target, and the route breaks the shared skeleton. The earlier “unknown routes return 200” defect was only half-fixed: status is now correct, presentation is not.
- Concrete fix: move 404 styling to a same-origin stylesheet or reuse the built app shell. Include the consistent header/footer, skip link, 44 px action, metadata, and neo-brutalist receipt identity. Add a live 404 test that asserts HTTP 404, no CSP console error, shared navigation, target size, and an axe-clean result.

### Major

#### F-1-4 — The documented `?demo=1` entry does not open the demo

- Exact quote/location: `.factory/demo.md`, **“Open `/demo` or add `?demo=1` to load the Harbor Mail sample archive.”**
- Evidence: a fresh `/?demo=1` returns the landing page with **“Check your export before access ends”**, no demo banner, and no sample receipt. `/demo` works.
- Why this misleads: the documented verifier/catalog entry has two equivalent forms, but only one is implemented. There is no claim test for the query form.
- Concrete fix: route `?demo=1` through the same sample-loading path as `/demo`, then add it to the demo-isolation browser test. Otherwise remove the query form from `.factory/demo.md` and all catalog guidance.

#### F-1-5 — The mobile first screen hides the action outcome and all three facts

- Exact quote/location: 390 × 844 cold landing. The art appears before the copy; **“Try it with sample data”** runs from y=820 to y=868. **“Loads a sample receipt now.”**, **“Runs in your browser”**, **“Works offline after first visit”**, and **“No account needed”** begin below the viewport.
- Why this costs a first-time visitor: the required action explanation and plain privacy/offline/account facts are not available before scrolling. A shorter phone can hide the primary action entirely.
- Concrete fix: put the mobile copy before the art or use a compact crop so the headline, audience sentence, full action, action outcome, and three facts fit in the first 844 px. Keep the current split composition on desktop.

#### F-1-6 — `/receipt` is a dead deep link disguised as a valid page

- Exact quote/location: direct live request to `/receipt`.
- Evidence: it returns HTTP 200 but renders the landing page and title **“Export Receipt — Check your data export”** while the address remains `/receipt`.
- Why this fails: a copied, reloaded, or back-forward receipt URL does not explain that no receipt is available. The URL, title, and state disagree.
- Concrete fix: render a route-specific empty state titled **“No receipt is open — Export Receipt”** with one `h1`, **Choose an export**, and **Try the sample receipt** actions. Alternatively keep completed receipts at a serializable local URL and restore them without exposing real data.

#### F-1-7 — Route metadata always describes and canonicals to the home page

- Exact quote/location: `/demo`, `/privacy`, `/terms`, and `/receipt` all retain canonical `https://export-receipt.sociobot.in/`, home description, and OG title **“Export Receipt — Check your data export”**. `twitter:title` and `twitter:description` are absent. The standalone 404 has no description, canonical, OG, Twitter, or favicon metadata.
- Why this fails: shared or indexed route URLs do not describe their actual page, and every route does not have the required canonical/social metadata.
- Concrete fix: update description, canonical, OG title/description/URL, and Twitter title/description on each SPA route. Add the same complete set to the 404 document and test each route after client navigation and direct load.

#### F-1-8 — “Missing categories for recognized layouts” is an unlisted claim

- Exact quote/location: README, **“It hashes the selected source, parses readable data, flags unsafe paths and missing categories for recognized layouts, and downloads signed HTML or JSON receipts.”**
- Evidence: no claim in `.factory/claims.json` promises recognized-layout detection. `sample-inventory` proves only the shipped Harbor Mail sample. Code contains Harbor Mail, Google Takeout, and Meta inspectors, but the latter two have no browser claim fixtures.
- Why this misleads: “recognized layouts” implies a tested set without naming it. A visitor cannot tell which services are covered or how accurately.
- Concrete fix: name the supported layouts in the README and add one `recognized-layouts` claim with real-looking ZIP fixtures for each layout, including positive, missing-category, ambiguous-match, and non-match cases. Otherwise narrow the sentence to the tested Harbor Mail sample.

#### F-1-9 — Signed receipts cannot be verified in the product

- Exact quote/location: landing, **“Download a signed HTML or JSON receipt with next checks.”**; receipt buttons **“Download signed JSON receipt”** and **“Download signed HTML receipt”**.
- Evidence: both downloads contain ECDSA signature material and the JSON claim test verifies it in test code, but the live product offers no **Verify receipt** path and no user-facing verification instructions. The public key travels inside the same editable receipt, so the signature alone does not establish an external identity.
- Why this is missed leverage: a normal person given a “signed” receipt needs to check whether it was changed. The current signature is not actionable from the interface.
- Concrete fix: add a local **Verify a receipt** import that reports signature validity, explains that the signer is this local browser rather than a trusted service, and optionally compares a reselected export with the saved SHA-256 hash. Keep it offline and add a tampered-receipt claim test. No AI feature is warranted for deterministic archive inspection.

### Minor — copy and polish

#### F-1-10 — The same input is called an export, archive, file, and source

- Exact quote/location: **“Check your export”**, **“what your archive contains”**, **“Choose … file”**, **“selected source”**, and **“Archives are not uploaded.”**
- Why this slows comprehension: the terminology table says the user-provided collection is “archive,” but the landing and README alternate four terms for it.
- Concrete fix: use **export** for the user’s input everywhere. Reserve **ZIP** or **file** only for file-format instructions. Suggested hero sentence: **“For people leaving a service, see what your export contains before your account disappears.”**

#### F-1-11 — The visible theme button does not name its result

- Exact quote/location: header button text **“Dark”** (and **“Light”** after activation).
- Why this is weak: the visible label is an adjective, not a result-naming action. Its accessible name is clearer than its displayed text.
- Concrete fix: show **“Use dark colors”** and **“Use light colors”** as the visible button labels.

#### F-1-12 — README audience sentence exceeds 22 words

- Exact quote/location: README, **“It is for people leaving a service or making a backup who need a local record of files, dates, categories, unreadable data, and next checks.”** — 25 words.
- Concrete rewrite: **“It is for people leaving a service or making a backup. It records files, dates, missing categories, unreadable data, and next checks.”**

#### F-1-13 — README feature sentence exceeds 22 words and hides four claims

- Exact quote/location: README, **“It hashes the selected source, parses readable data, flags unsafe paths and missing categories for recognized layouts, and downloads signed HTML or JSON receipts.”** — 24 words.
- Concrete rewrite: **“It hashes your export and parses readable data. It flags unsafe paths and supported missing categories. You can download signed HTML or JSON receipts.”** Register the supported-layout claim as specified in F-1-8.

#### F-1-14 — README limit sentence exceeds 22 words

- Exact quote/location: README, **“Inspection rejects sources over 50 MB and ZIPs with more than 1,000 entries, over 50 MB expanded data, or a ratio above 100:1.”** — 23 words.
- Concrete rewrite: **“Exports must be 50 MB or smaller. ZIPs must contain at most 1,000 entries, expand to 50 MB or less, and stay below 100:1 compression.”**

#### F-1-15 — README test-coverage sentence exceeds 22 words and uses internal jargon

- Exact quote/location: README, **“The browser suite covers every registered claim, demo isolation, archive limits, signed downloads, offline reload, desktop and 390px keyboard use, and axe in both themes.”** — 25 words.
- Concrete rewrite: **“Browser tests cover every registered claim. They also check demo isolation, limits, downloads, offline use, keyboard access, and both color modes.”**

## Copy audit

Word-count convention: hyphenated terms, URLs, and code spans count as one word. Navigation labels, control labels, headings, alt text, captions, and the hidden update message are included so the audit covers the complete authored landing copy.

### Landing page

| Copy | Words | Flag |
|---|---:|---|
| Skip to inspection | 3 | — |
| EXPORT RECEIPT | 2 | — |
| Demo | 1 | — |
| How it works | 3 | — |
| Privacy (header) | 1 | — |
| Dark / Light | 1 | F-1-11: button is not a result-naming verb |
| Use dark colors / Use light colors | 3 / 3 | Accessible name passes |
| LOCAL ARCHIVE CHECK | 3 | F-1-10: “archive” conflicts with “export” |
| Check your export before access ends | 6 | — |
| For people leaving a service, see what your archive contains before an account disappears. | 14 | F-1-10: “archive” conflicts with “export” |
| Try it with sample data | 5 | — |
| Loads a sample receipt now. | 5 | — |
| Runs in your browser | 4 | — |
| Works offline after first visit | 5 | F-1-1: tested behavior fails |
| No account needed | 3 | — |
| An archive folder, magnifier, and printed data receipt on a workbench. | 11 | F-1-10: “archive” conflicts with “export” |
| Generated product illustration: inspect the archive, then keep the receipt. | 10 | F-1-10: “archive” conflicts with “export” |
| THE RECEIPT DESK | 3 | — |
| Open an export to make a receipt | 7 | — |
| Choose a ZIP, JSON, CSV, or text file. | 8 | F-1-10: “file” is used for the input concept |
| Nothing is uploaded. | 3 | — |
| Choose an export | 3 | — |
| ZIP · JSON · CSV · TXT | 4 | — |
| How Export Receipt checks an archive | 6 | F-1-10: “archive” conflicts with “export” |
| Choose | 1 | — |
| Open an export on this device. | 6 | — |
| Inspect | 1 | — |
| Count files, dates, categories, attachments, and parse errors. | 8 | — |
| Keep | 1 | — |
| Download a signed HTML or JSON receipt with next checks. | 10 | F-1-9: no user-facing verification path |
| What this does not do | 5 | — |
| It inspects only the file you choose. | 7 | F-1-10: “file” is used for the input concept |
| It does not connect to your service account. | 8 | — |
| Export Receipt checks local exports before access disappears. | 8 | — |
| Privacy (footer) | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| v1.0.0 | 1 | — |
| An update is ready. | 4 | — |
| Reload | 1 | — |

No landing sentence exceeds 22 words and no banned marketing adjective appears. Headings form a coherent outline. The flags above cover terminology, claim accuracy, and the one non-result button label.

### README

| Copy | Words | Flag |
|---|---:|---|
| Export Receipt | 2 | — |
| Check a data export before access ends. | 7 | — |
| It is for people leaving a service or making a backup who need a local record of files, dates, categories, unreadable data, and next checks. | 25 | F-1-12: over 22 words |
| The app reads ZIP, JSON, CSV, and text exports in the browser. | 12 | — |
| It hashes the selected source, parses readable data, flags unsafe paths and missing categories for recognized layouts, and downloads signed HTML or JSON receipts. | 24 | F-1-8, F-1-10, F-1-13: unlisted claim, inconsistent term, over 22 words |
| Archives are not uploaded. | 4 | F-1-10: inconsistent term |
| Inspection rejects sources over 50 MB and ZIPs with more than 1,000 entries, over 50 MB expanded data, or a ratio above 100:1. | 23 | F-1-10, F-1-14: inconsistent term and over 22 words |
| JSON and CSV files over 20 MB are inventoried but not parsed. | 12 | — |
| Run | 1 | — |
| Requires Node 20 or newer. | 5 | — |
| Open `http://localhost:5173/demo` for the isolated sample. | 6 | — |
| It reconstructs sample data in memory and stores nothing. | 9 | F-1-2: not true for every demo control |
| Verify and build | 3 | — |
| `npm test` runs parser regressions plus Chromium checks against the production build. | 12 | Technical README context is clear |
| The browser suite covers every registered claim, demo isolation, archive limits, signed downloads, offline reload, desktop and 390px keyboard use, and axe in both themes. | 25 | F-1-15: over 22 words and dense internal jargon |
| The static deploy output is `dist/`, with `index.html` at its root; deploy that directory with the included `staticwebapp.config.json`. | 18 | — |
| Privacy | 1 | — |
| Export Receipt has no account, analytics, server API, or archive upload. | 11 | F-1-10: inconsistent term |
| Color mode is the only browser preference it stores. | 9 | — |
| See `/privacy` and `/terms` in the app. | 7 | — |
| It is released under the MIT License. | 7 | — |
| Catalog description | 2 | — |
| Check a data export before access ends with a local receipt of files, dates, categories, and warnings. | 17 | — |

No banned marketing adjective appears. README headings make sense in repository context.

## Demo and sandbox result

- One-click landing path: PASS. The button opens `/demo` in one click.
- First demo screen: PASS. It immediately shows Harbor Mail files, one attachment, date coverage, and **Missing category: Profile**.
- Persistent banner: PASS visually.
- Reset: PASS for the in-memory sample; the before/after receipt text matched.
- Start for real: PASS for discarding the sample and returning to the local picker.
- Sample-data storage: PASS when no global control is used; localStorage, sessionStorage, and IndexedDB remained empty.
- Real-storage isolation: FAIL; see F-1-2.
- Documented `?demo=1`: FAIL; see F-1-4.
- Request privacy: PASS. Landing, demo, reset, inspection, and offline exercises made only same-origin requests. No analytics, account, payment, AI, or API traffic appeared.
- Offline demo after one visit: FAIL; see F-1-1.

## Claims audit

Each exact registered command was run separately after `npm ci` in clean clone `/tmp/export-receipt-review.x0xvoX/repo`.

| Claim | Registered command | Result |
|---|---|---|
| sample-inventory | `npm test -- --grep @claim:sample-inventory` | PASS |
| local-only | `npm test -- --grep @claim:local-only` | PASS |
| json-receipt | `npm test -- --grep @claim:json-receipt` | PASS |
| html-receipt | `npm test -- --grep @claim:html-receipt` | PASS |
| supported-formats | `npm test -- --grep @claim:supported-formats` | PASS |
| source-hash | `npm test -- --grep @claim:source-hash` | PASS |
| parse-errors | `npm test -- --grep @claim:parse-errors` | PASS |
| offline-reload | `npm test -- --grep @claim:offline-reload` | PASS, but under-asserts the one-visit claim; F-1-1 |
| account-free | `npm test -- --grep @claim:account-free` | PASS |
| preference-storage | `npm test -- --grep @claim:preference-storage` | PASS |
| demo-isolation | `npm test -- --grep @claim:demo-isolation` | PASS, but omits the theme control; F-1-2 |
| safe-archive-limits | `npm test -- --grep @claim:safe-archive-limits` | PASS |

Unlisted or untested behaviors:

- README support for **“missing categories for recognized layouts”** lacks a corresponding multi-layout claim; F-1-8.
- `.factory/demo.md` says `?demo=1` opens the sample, but no claim test covers it and live behavior fails; F-1-4.

The green commands therefore do not justify a claim-complete result.

## Earlier finding re-check

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist. I re-checked every defect in `.factory/verification.md`, `.factory/verification-2.md`, `.factory/verification-3.md`, and the prior handoff.

| Earlier finding | Live/code result |
|---|---|
| Valid JSON over 1 MB marked unreadable | Fixed; 30,000-record regression passes. |
| Readable count included malformed data | Fixed; regression counts only parsed tables. |
| Quoted multiline CSV overcounted | Fixed; regression passes. |
| Impossible calendar dates accepted | Fixed; regression passes. |
| Common-export/category inspectors absent | Fixed in code for Harbor Mail, Google Takeout, and Meta; public multi-layout claim remains untested as F-1-8. |
| Receipts were unsigned | Fixed; both downloads contain signatures and the JSON test verifies its signature. User-facing verification remains missing as F-1-9. |
| Claim tests did not use browsers | Fixed structurally; every registered claim runs in Chromium. Offline and demo-isolation assertions remain incomplete as F-1-1 and F-1-2. |
| Serious contrast and target-size failures | Fixed on app routes; live axe reports zero violations in demo light/dark. The 404 regresses target size under F-1-3. |
| Hostile ZIP decompression was unbounded | Fixed with preflight source, entry, expanded-size, ratio, and text-size limits. |
| Unknown routes returned landing with HTTP 200 | Status fixed to 404; designed presentation is half-fixed and blocking under F-1-3. |
| Root assets were not immutable | Fixed; hashed `/assets/*` files have immutable caching. |
| Dependency audit findings | Fixed; clean `npm audit --omit=dev` reports zero vulnerabilities. |
| CSP allowed unsafe inline style and lacked framing protection | Fixed for the app; `frame-ancestors 'none'` is present. The stricter policy exposes the 404 inline-style defect in F-1-3. |
| Visitor claims were absent from the registry | Mostly fixed; F-1-8 is still unlisted and F-1-1/F-1-2 are under-tested. |
| Initial focus skipped the skip link | Fixed; initial focus is `BODY` and first Tab reaches **Skip to inspection**. Route navigation focuses the new `h1`. |

The previous PASS handoff statements that a fresh offline demo reload works and that the unknown route is designed are not confirmed by a strict first-visit/offline test and the live CSP console.

## Structure, accessibility, and visual identity

- Root, demo, privacy, and terms titles follow the required pattern. `/receipt` fails its deep-link state/title under F-1-6.
- App routes have `lang="en"`, one `h1`, a `main`, ordered headings, alt text, focus treatment, and consistent header/footer.
- Canonical/social metadata fails per route under F-1-7.
- All discovered landing links returned 200. The unknown route returned 404.
- Back and forward navigation restore the route and focus its `h1`. A deep-scrolled home position restored within 51 px after back navigation; no blocking loss of context was observed.
- Live axe found zero violations on the 390 px demo in light and dark modes. `/opt/fleet/lib/verify-url.sh` passed the root document with no load errors.
- No horizontal overflow occurred at 390 px. App-route visible controls met 44 px targets.
- The neo-brutalist paper, ink, lime, orange, blue, hard-shadow, folder/receipt system is distinct and matches `.factory/design.md`; it does not look like a generic SaaS template. The CSP-broken 404 is the exception.
- The root application JavaScript is 20.06 kB raw / 8.06 kB gzip, well below the budget.

## Quality gates

From the clean clone:

```text
npm ci                  PASS — 157 packages, 0 vulnerabilities
12 registered commands PASS individually
npm test                PASS — 7 unit tests and production browser suite
npm run lint            PASS
npm run build           PASS — dist/ produced
npm audit --omit=dev    PASS — 0 vulnerabilities
```

## What would make this perfect

Resolve F-1-1 through F-1-15 and rerun this review from a new browser profile. A perfect result has a true one-visit offline demo; zero real-namespace writes from every demo control; a CSP-clean, fully structured 404; working documented demo URLs; complete route metadata and deep-link states; one term for the input; no sentence over 22 words; every visitor claim registered with a test that asserts the exact wording; and a local way to verify the signed receipt. At that point there should be no remaining qualification, caveat, or untested claim.
