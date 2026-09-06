# Verify a service export before access ends — verification 4

**Verdict: FAIL**

Verified 2026-09-06 UTC at <https://export-receipt.sociobot.in>. There are **3 findings** and **0 untested claims**. Product code was not changed.

## Reviewed versions

- Implementation candidate: `6f0739ef17c4a1fccb85f715c099a2385b312e08`
- Documentation candidate: `feffdf5528f034701c0c2a3a287bad83aec9cac9`
- Deployment ID supplied with the work order: `7cec1f4b-f8b2-446a-8d90-3586e981300c`

The commits after the implementation candidate change only the handoff and Graphify output. A clean checkout of the documentation candidate has no product-source difference from the implementation candidate. Live `index.html`, JavaScript, worker, CSS, hero image, service worker, manifest, 404 page, offline page, and status CSS byte-match the clean production build.

## First screen before scrolling

Fresh Chromium contexts were used at 390 × 844 and 1440 × 900.

- Job: check an export before access ends.
- Audience: people leaving a service before their account disappears.
- First action: **Try it with sample data**.

The audience sentence is **“For people leaving a service, see what your export contains before an account disappears.”** The action says that it loads a sample receipt. The privacy, offline, and free/no-account facts are visible without scrolling. The content ends at 641 CSS px on the phone and 761 CSS px on desktop.

## Findings

### Major — V4-1: the real export picker has no visible keyboard focus

The real first-step file input, `#archive`, fills `.drop-zone` and has `opacity: 0`. When reached with the keyboard, Chromium reports that the input is active and matches `:focus-visible`. Its computed 4 px focus outline is composited at zero opacity. The visible label receives no focus outline or other state change.

A screenshot of the picker before focus and another after keyboard focus were pixel-identical, with SHA-256 `8c86d68f045ce0b733f48cd605a81d0b2d45ccce2814c9beaa5e0ce1d51706fe`. Enter and Space can open the chooser, but a keyboard user cannot see where focus is. This fails the required visible focus indicator for every interactive element.

Evidence: `/work/.evidence/verification-4/file-picker-focus-mobile.png` and the computed-style check showing `active: true`, `focusVisible: true`, input `opacity: 0`, and label `outline: none`.

Required correction: add a designed `:focus-within` or `:has(input:focus-visible)` focus treatment to the visible drop zone, verify at least 3:1 contrast in both themes, and add a browser regression that compares the visible container state.

### Minor — V4-2: the required 180 px Apple touch icon is missing

The site-structure contract requires an SVG favicon and a 180 px Apple touch icon. Both `index.html` and the static 404 point `rel="apple-touch-icon"` to `/icon-192.png`. The served PNG is 192 × 192, and no 180 × 180 touch icon exists.

Required correction: ship a 180 × 180 Apple touch icon and reference it from the application shell and 404 page. Keep the 192 px and 512 px PWA icons in the manifest.

### Minor — V4-3: generated imagery is not disclosed on the site

`.factory/design.md` records that the landing illustration was generated with the factory image deployment. The attached image-generation contract requires generated imagery to be disclosed on an About page or in the footer. The site has no About page, and the shared footer does not disclose the generated illustration.

Required correction: add a short plain disclosure to the shared application footer and the static 404 footer.

## Sample and real-data isolation

- One click opens `/demo` and focuses **Your export at a glance**.
- The Harbor Mail sample shows four files, two readable JSON/CSV files, one attachment, dates from 2022-02-19 to 2025-01-08, and **Missing category: Profile**.
- Its 869 bytes hash to `312216e21b560a39c5bfac1b493917144b901fd25d1504777f0eaa462bc8b6c5`, matching the UI and downloaded receipts.
- The persistent label says **Demo — sample data, nothing is saved**. **Reset demo** recreates the same four-file result.
- **Start for real**, browser Back, and the wordmark remove the sample. Demo color changes and reset leave the real color preference unchanged.
- Demo and real flows produced no cross-origin, API, credential, non-GET, cookie, analytics, payment, or upload traffic.

## Claims

After `npm ci` in a fresh checkout, every exact command in `.factory/claims.json` ran separately.

| Claim ID | Result | Observed proof |
|---|---|---|
| `sample-inventory` | PASS | Four files, attachment, date range, and missing Profile category. |
| `local-only` | PASS | Fixture inspection produced no upload, API, or cross-origin request. |
| `json-receipt` | PASS | Downloaded JSON contained next checks and a verifiable bundled signature. |
| `html-receipt` | PASS | Downloaded HTML contained the exact source hash, findings, and checklist. |
| `supported-formats` | PASS | ZIP, JSON, CSV, and text fixtures each produced a receipt. |
| `source-hash` | PASS | UI and JSON used SHA-256 over every byte of the sample ZIP. |
| `parse-errors` | PASS | Malformed JSON produced the promised unreadable-data finding. |
| `offline-reload` | PASS | The complete sample reloaded offline after one online visit. |
| `account-free` | PASS | No account, payment, analytics, cookie, or API behavior appeared. |
| `preference-storage` | PASS | Only `export-receipt:theme` persisted outside demo mode. |
| `demo-isolation` | PASS | Reset, exit, Back, Home, and color changes preserved real storage. |
| `safe-archive-limits` | PASS | Unsafe paths and every documented size, count, and ratio limit were exercised. |
| `recognized-layouts` | PASS | Harbor Mail, Google Takeout, and Meta Download fixtures covered positive, missing, ambiguous, and non-match cases. |
| `receipt-verification` | PASS | Valid, tampered, and replacement-key re-signed receipts received accurate results. |

The full suite also proves that each registered claim has exactly one tagged browser test and that visitor claim annotations match the registry. Landing, receipt, privacy, README, and demo statements map to registered tests. There are **0 untested claims**.

## Normal, invalid, boundary, and recovery paths

- Normal ZIP, JSON, CSV, and text exports produce complete receipts.
- Large valid JSON, quoted multiline CSV, calendar-valid dates, and readable-file counts pass unit regressions.
- Malformed JSON is inventoried as unreadable with a next step. An unsupported file gives a clear supported-format error.
- A valid selection succeeds after an error without reloading. **Check another export** restores a usable start state.
- Exact 1,000-entry and 50 MB expanded ZIP boundaries pass. Over-limit source, entry, expansion, compression-ratio, and text cases stop safely.
- Hostile paths are flagged. Overlapping supported layouts are described as ambiguous instead of guessed.
- HTML is described as unsigned. JSON verification accurately limits itself to the bundled signature and does not claim signer identity or re-signing detection.

## Accessibility, routes, privacy, and PWA

- `/opt/fleet/lib/verify-url.sh` passes with the expected title, `lang="en"`, one h1, a main landmark, image alternatives, labelled buttons, and no console error.
- Axe reports zero violations of any severity on all five application routes, the 404, and the light and dark demo. Finding V4-1 is a manual focus-visibility failure that axe does not detect.
- First Tab reaches **Skip to main content**; Enter focuses `main`. Enter opens the sample, Space resets it, route changes focus the new h1, and the inventory region scrolls from 0 to 31 px with ArrowRight.
- Visible controls otherwise meet 44 px targets. There is no keyboard trap. Reduced-motion mode reduces transitions to `0.00001s`.
- The review-7 repairs pass: all application/status headers have no overlap, clipping, crowding, or page overflow at 200% text; skip links are hidden off-screen and fully visible on focus. Focus contrast measures 6.75:1 and 7.01:1 on light surfaces, then 7.21:1 and 5.89:1 on dark surfaces.
- `/`, `/demo`, `/privacy`, `/terms`, and `/receipt` return 200 with distinct titles, metadata, one h1, and shared landmarks. Every linked local asset and the repository privacy-contact destination returns 200.
- A deliberate unknown path returns the designed page with HTTP 404. The same remains true after service-worker control. Expected 404 resource console messages are not classified as defects.
- Privacy and Terms are present. The privacy page states the storage and network behavior and provides a working questions link.
- One online demo visit is enough for a complete offline reload. The worker has versioned caches, `skipWaiting`, `clients.claim`, and an update listener. No public claim requires manufacturing a new deployed worker version.
- This is a static local-only PWA. Backend tenant isolation, database restart persistence, health endpoints, and 429/`Retry-After` checks do not apply.

## Performance and quality gates

| Check | Result |
|---|---|
| `npm ci` | PASS; 157 packages and 0 vulnerabilities |
| Every claim command | PASS; 14 of 14 run separately |
| `npm test` | PASS; 9 unit tests and the production-browser suite |
| `npm run lint` | PASS |
| `npm run build` | PASS; `dist/index.html` produced |
| `npm audit` | PASS; 0 vulnerabilities |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |
| App JavaScript | 25.02 kB raw; 10.06 kB gzip |
| Worker JavaScript | 11.67 kB raw |
| CSS | 12.68 kB raw; 3.68 kB gzip |
| Hero image | 39.34 kB WebP |
| Lighthouse mobile `/demo` | Performance 100; Accessibility 100; Best Practices 100; SEO 100 |
| Lighthouse metrics | FCP 0.9 s; LCP 1.2 s; TBT 20 ms; CLS 0 |

The first Lighthouse invocation did not set `CHROME_PATH` and produced no measurement. The completed run used the work-order-provided Playwright Chromium and is the result reported above.

## Earlier findings

Every earlier verification, review, polish report, and handoff was inspected. Earlier closure statements were treated as leads and rechecked against the clean build and live deployment.

| Earlier finding | Current disposition |
|---|---|
| Initial parser errors for ordinary JSON/CSV and misleading readable counts | Closed: nine focused unit regressions pass, including large JSON, multiline CSV, valid dates, and readable counts. |
| Initial missing common-export/category inspectors | Closed: three named layouts and missing, ambiguous, and non-match fixtures pass. |
| Initial unsigned receipts | Closed for JSON; HTML is accurately labelled as a readable unsigned copy. |
| Initial non-browser claim tests and unlisted claims | Closed: all 14 commands exercise observable browser outcomes; registry and public annotations agree. |
| Initial text contrast, inventory focusability, and small targets | The original issues remain closed. V4-1 is a distinct untested focus state on the real picker. |
| Initial unbounded hostile ZIP processing | Closed: preflight limits and boundary tests pass. |
| Initial 404, caching, audit, and header defects | Closed: designed true 404s, hashed immutable assets, zero vulnerabilities, and strict headers pass. |
| Verification 2 initial-focus defect | Closed: initial focus remains on the body and the skip link is first. |
| F-1-1 through F-1-15 | Closed by live offline, isolation, 404, query-demo, first-screen, route, metadata, named-layout, receipt, terminology, control-copy, and copy-audit checks. |
| F-2-1 | Closed at normal and 200% text: required phone navigation stays visible and usable. |
| F-3-1 through F-3-6 | Closed by Back/Home isolation, sitemap parity, plain headings, contact-link, and useful-caption checks. |
| F-4-1 through F-4-5 | Closed by limited signature wording, exact sample hash, explicit first-screen facts, consistent skip links, and inclusive limit tests. |
| F-5-1 | Closed: a service-worker-controlled unknown navigation returns HTTP 404. |
| F-7-1 | Closed: phone headers stack without overlap or overflow at 200% text on every application route and 404. |
| F-7-2 | Closed: measured focus colors exceed 3:1 on every tested light and dark surface. |

## Missed-feature check

No missing AI, sync, import, or export step is implied by the job. The app already imports the supported export formats, provides a realistic isolated sample, exports HTML and signed JSON receipts, and checks JSON signatures locally. AI or remote sync would add privacy and network costs to a deterministic local task.

## Evidence

- Live verifier: `/work/.evidence/verification-4/live/polish-5-verify.json`
- Factory URL verifier: `/work/.evidence/verification-4/verify-url/verify.json`
- Lighthouse: `/work/.evidence/verification-4/lighthouse.json`
- Fresh first screens: `/work/.evidence/verification-4/phone-first-screen.png` and `/work/.evidence/verification-4/desktop-first-screen.png`
- Populated samples: `/work/.evidence/verification-4/phone-sample.png` and `/work/.evidence/verification-4/desktop-sample.png`
- File-picker focus: `/work/.evidence/verification-4/file-picker-focus-mobile.png`
- Repaired 200% header: `/work/.evidence/verification-4/live/repair-3-header-200-percent.png`
- Controlled 404: `/work/.evidence/verification-4/live/polish-5-controlled-404-mobile.png`

The candidate remains **FAIL** until all three findings are corrected and independently reverified.
