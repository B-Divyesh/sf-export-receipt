# Check a service export before access ends — review 7

**Verdict: FAIL**

Reviewed 2026-09-06 UTC at <https://export-receipt.sociobot.in>. There are **2 findings** and **0 untested claims**. Both findings are accessibility defects. Product code was not changed.

## Reviewed versions

- Implementation candidate: `58e5f62c1808939bebfad1148f17edb23c741f36`
- Latest documentation commit before this review: `3ee4d0686098979d4e8a23248bc91fcd4b2d9de8`
- Supplied checkout/base: `11396b6fbe8233f70ec49bcfb690e5de7f009780`

Commits after `58e5f62` contain reports, evidence, or Graphify output, not product changes. A clean build produced `app-DhkiHgSm.js`, `index-BIjY8ofT.css`, `inspect-worker-BDAY-Bhq.js`, and `archive-workbench-CaonS06W.webp`. Every live file has the same SHA-256 as its clean-build counterpart. The live service worker, manifest, and 404 page also match the clean build byte for byte.

## First screen before scrolling

Fresh Chromium contexts were used at 390 × 844 and 1440 × 900.

- Job: check a service export before access ends.
- Audience: people leaving a service before their account disappears.
- First action: **Try it with sample data**.

The headline, audience sentence, action, action outcome, and three facts are visible without scrolling on both sizes. On the phone, the action and facts end at 599 px. The words are direct, sentence lengths stay within the 22-word limit, and no banned marketing wording appears.

## Findings

### Major — F-7-1: navigation text overlaps at 200% text size

At 390 px wide with the root text size increased to 200%, the wordmark, **Demo**, and **Privacy** render on top of one another. This occurs on `/`, `/demo`, `/privacy`, `/terms`, and `/receipt`. The static 404 has the same failure.

Evidence:

- `/work/.evidence/review-7/header-200-percent.png`
- `/work/.evidence/review-7/404-header-200-percent.png`
- The live header remains 358 px wide, but its non-wrapping flex children shrink and their text paints across adjacent controls.

The rest of the content remains available, but the primary navigation is not legible at the required text size. This fails the attached requirement that text resize to 200% without loss.

Required correction: let the compact header stack or wrap at enlarged text sizes, prevent text from painting outside each control, and add a 200% regression for all application routes and the 404.

### Minor — F-7-2: the light-theme focus ring is below 3:1 contrast

The common focus style is a 4 px `#ff7043` outline with a 3 px offset. Its contrast is 2.59:1 against the light page `#fff8e8` and 2.70:1 against the light panel `#fffdf6`. The required focus-indicator contrast is at least 3:1.

Keyboard order, operation, and focus visibility otherwise work. The dark treatment has sufficient contrast. This manual contrast check is not covered by axe or Lighthouse.

Required correction: use a darker light-theme focus token or a two-color focus indicator that reaches 3:1 on every adjacent surface. Add a computed-color regression for light and dark treatments.

## Sample and real-data isolation

- One click opens `/demo` and focuses **Your export at a glance**.
- The sample shows four files, two readable data files, one attachment, dates from 2022-02-19 to 2025-01-08, and **Missing category: Profile**.
- The banner stays visible and says **Demo — sample data, nothing is saved**.
- **Reset demo** rebuilds the same receipt. **Start for real**, browser Back, and the wordmark remove the sample.
- A seeded real color preference is unchanged by demo color changes, reset, Back, Home, and exit.
- Local storage, session storage, IndexedDB, cookies, and request logs show no demo-data persistence or data request.
- `/?demo=1` normalizes to `/demo` and behaves the same way.

## Normal, invalid, boundary, and recovery paths

- Normal: the live sample and a separate valid JSON export both produce complete receipts.
- Invalid: an unsupported `.exe` produces **Choose a ZIP, JSON, CSV, or text export. This file is not readable yet.**
- Recovery: a valid JSON selection succeeds immediately after that error without a reload. **Check another export** returns to a usable start path.
- Malformed: malformed JSON is inventoried and marked **Unreadable JSON** with a next step.
- Boundaries: exactly 1,000 ZIP entries and exactly 50 MB expanded data pass. Over-limit source, entry, expansion, ratio, and text fixtures produce the documented safe outcomes.
- Hostile paths are flagged. Ambiguous recognized layouts are reported instead of guessed.
- Signed JSON checks pass for valid, tampered, and replacement-key re-signed receipts without claiming signer identity or unchanged history.

## Claims

Dependencies were installed with `npm ci` in clean checkout `/tmp/export-receipt-review7.MwLC36/repo`. Every exact command in `.factory/claims.json` then ran separately.

| Claim | Exact command | Result |
|---|---|---|
| `sample-inventory` | `npm test -- --grep @claim:sample-inventory` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `json-receipt` | `npm test -- --grep @claim:json-receipt` | PASS |
| `html-receipt` | `npm test -- --grep @claim:html-receipt` | PASS |
| `supported-formats` | `npm test -- --grep @claim:supported-formats` | PASS |
| `source-hash` | `npm test -- --grep @claim:source-hash` | PASS |
| `parse-errors` | `npm test -- --grep @claim:parse-errors` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `account-free` | `npm test -- --grep @claim:account-free` | PASS |
| `preference-storage` | `npm test -- --grep @claim:preference-storage` | PASS |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS |
| `safe-archive-limits` | `npm test -- --grep @claim:safe-archive-limits` | PASS |
| `recognized-layouts` | `npm test -- --grep @claim:recognized-layouts` | PASS |
| `receipt-verification` | `npm test -- --grep @claim:receipt-verification` | PASS |

The full suite confirms that every registered claim has exactly one tagged browser test. Landing, receipt, privacy, README, and demo statements map to the registry. No missing, false, incomplete, or untested public claim was found.

## Accessibility and keyboard checks

- `verify-url.sh` passes: title, `lang="en"`, one h1, main landmark, image alternatives, labelled buttons, and no console error.
- Playwright axe reports zero serious or critical issues on all five application routes and the 404 at 390 px.
- Lighthouse accessibility is 100.
- Both color treatments pass automated contrast checks, but F-7-2 records the separate manual focus-indicator failure.
- First Tab reaches **Skip to main content**. Enter moves focus to `main`.
- Enter opens the sample. Space resets it. Route changes and Back focus the destination h1.
- The inventory region accepts focus, and ArrowRight scrolls it from 0 to 31 px.
- Normal-size live controls meet the 44 px target check. No keyboard trap was found.
- Reduced-motion mode changes transitions to `0.00001s` and does not loop or flash.
- The 200% check found F-7-1; other route content remained present.

## Routes, links, legal pages, privacy, and PWA

- `/`, `/demo`, `/privacy`, `/terms`, and `/receipt` return 200 with route-specific titles, descriptions, canonical links, one h1, and shared landmarks.
- A cold unknown route and a service-worker-controlled unknown route return the designed page with HTTP 404. The expected browser resource message for the deliberate 404 is not classified as a product error.
- Every internal route, PWA asset, social card, icon, manifest, robots file, sitemap, and the disclosed repository issues link returns 200.
- Privacy and Terms load and state the local-only limits in plain words. The privacy contact destination is usable.
- The full demo and real-export request logs contain only same-origin GET requests. There is no analytics, account, payment, API, AI, credential, upload, WebSocket, or cross-origin traffic.
- One online `/demo` visit is enough for a complete offline reload.
- The service worker uses a versioned cache, `skipWaiting`, `clients.claim`, declared-route navigation handling, and an application update listener. A production version transition was not manufactured; no public update claim depends on it.
- This is a static PWA. Backend tenant isolation, restart persistence, health endpoints, and 429/`Retry-After` behavior are not applicable.

## Performance and quality gates

| Check | Result |
|---|---|
| `npm ci` | PASS; 157 packages, 0 vulnerabilities |
| `npm test` | PASS; 9 unit tests and production browser suite |
| `npm run lint` | PASS |
| `npm run build` | PASS; `dist/` produced |
| App JavaScript | 25.02 kB raw, 10.06 kB gzip |
| Worker JavaScript | 11.67 kB raw |
| CSS | 12.30 kB raw, 3.58 kB gzip |
| Hero image | 39.34 kB WebP |
| Lighthouse mobile | Performance 100; Accessibility 100; Best Practices 100; SEO 100 |
| Lighthouse metrics | LCP 1.1 s; TBT 0 ms; CLS 0 |

The first Lighthouse launch lacked `CHROME_PATH`, and a second browser process crashed. The completed run used the work-order-provided Playwright Chromium with `--disable-dev-shm-usage`; its JSON is in `/work/.evidence/review-7/lighthouse.json`.

## Earlier findings

Every prior review, verification, polish report, and handoff was read. Earlier closure statements were treated as leads and checked against the current live site, source, clean build, and tests.

| Earlier finding | Current disposition |
|---|---|
| Initial: large valid JSON, readable counts, multiline CSV, invalid dates | Fixed. Nine unit tests cover these cases; the full suite passes. |
| Initial: common-layout and missing-category scope absent | Fixed. Three named layouts plus missing, ambiguous, and non-match cases pass. |
| Initial: receipts unsigned | Fixed for JSON. HTML is plainly identified as a readable copy. |
| Initial: claim commands did not exercise browsers | Fixed. All 14 commands exercise production browser flows. |
| Initial: contrast, scroll-region focus, and small targets | The original defects remain fixed. New focus contrast and 200% defects are F-7-1 and F-7-2. |
| Initial: hostile ZIP limits absent | Fixed. Preflight and all documented boundaries pass. |
| Initial: 404, unhashed assets, dependency audit, and weak headers | Fixed. True 404s, hashed immutable assets, zero audit vulnerabilities, and strict headers are present. |
| Verification 2: public claims missing from registry | Fixed. Registry and public annotations agree; 0 untested claims. |
| Verification 2: initial focus bypassed skip link | Fixed. Body starts focused and the skip link is first in Tab order. |
| F-1-1 | Fixed: one-visit demo reload works offline. |
| F-1-2 | Fixed: demo actions do not alter real storage. |
| F-1-3 | Fixed: cold and controlled unknown routes are styled HTTP 404 responses. |
| F-1-4 | Fixed: `?demo=1` opens the isolated demo. |
| F-1-5 | Fixed: action outcome and all three facts fit the normal 390 × 844 first screen. |
| F-1-6 | Fixed: direct `/receipt` shows a useful empty state. |
| F-1-7 | Fixed: route metadata is specific and complete. |
| F-1-8 | Fixed: recognized-layout behavior is registered and tested. |
| F-1-9 | Fixed: JSON verification wording is limited to its bundled signature; HTML is not called signed. |
| F-1-10 | Fixed: visitor input uses the term **export** consistently. |
| F-1-11 | Fixed: color controls name the resulting mode. |
| F-1-12 | Fixed: README audience copy is short and plain. |
| F-1-13 | Fixed: README feature statements are short and registered. |
| F-1-14 | Fixed: README limits are short and exact. |
| F-1-15 | Fixed: README test description is short and accurate. |
| F-2-1 | Fixed at normal text size: Demo and Privacy remain visible 44 px mobile targets. F-7-1 is a separate 200% text failure. |
| F-3-1 | Fixed: Back and Home leave the demo, discard it, and restore real state. |
| F-3-2 | Fixed: `/receipt` is in the sitemap. |
| F-3-3 | Fixed: the section label names the task. |
| F-3-4 | Fixed: the Terms h1 names the page. |
| F-3-5 | Fixed: Privacy provides a working, labelled contact link. |
| F-3-6 | Fixed: the illustration caption explains its purpose. |
| F-4-1 | Fixed: replacement-key receipts never claim browser identity or unchanged history. |
| F-4-2 | Fixed: the sample uses one real 869-byte ZIP with exact full digest in UI and downloads. |
| F-4-3 | Fixed: privacy, offline, and free/no-account facts are explicit above the fold. |
| F-4-4 | Fixed: every route and status page uses **Skip to main content**. |
| F-4-5 | Fixed: runtime and README use the same inclusive ZIP boundaries. |
| F-5-1 | Fixed: a controlled service worker preserves true HTTP 404 status. |

## Missed feature check

No missing AI, sync, import, or export feature was found. Local ZIP/JSON/CSV/text inspection, named-layout checks, HTML/JSON receipt export, and local signature checking complete the brief's expected loop. AI or sync would add network and privacy costs without helping this deterministic task.

## Evidence

- Live verifier: `/work/.evidence/review-7/live-checks/polish-5-verify.json`
- Factory verifier: `/work/.evidence/review-7/verify-url/verify.json`
- Claim command log: `/work/.evidence/review-7/claim-commands.log`
- Lighthouse: `/work/.evidence/review-7/lighthouse.json`
- Fresh first screens: `/work/.evidence/review-7/phone-first-screen.png` and `/work/.evidence/review-7/desktop-first-screen.png`
- Accessibility findings: `/work/.evidence/review-7/header-200-percent.png` and `/work/.evidence/review-7/404-header-200-percent.png`

## Required next steps

1. Repair the 200% compact-header layout on all application and status pages.
2. Raise light-theme focus-indicator contrast to at least 3:1 on every adjacent surface.
3. Add regressions for both findings, deploy the new implementation, and repeat the live review.

The product remains **FAIL** until both findings are closed.
