# Independent product verification — FAIL

**Candidate:** `888d44e08193169f2aa7156607d6e8c179181e13`  
**Live URL:** <https://export-receipt.sociobot.in>  
**Verified:** 2026-08-28 UTC  
**Verdict:** **FAIL — do not release this candidate.**

The live deployment is available and matches the candidate, but the product does not meet the researched job-to-be-done or the factory acceptance contract. The principal blockers are misleading results for ordinary exports, absent common-export/category inspectors, unsigned receipts, non-conforming claim tests, serious accessibility failures, and unbounded hostile-archive decompression.

## First-read test

Cold desktop and 390 px mobile loads pass the plain-words gate:

- What it does: “Check your export before access ends.”
- For whom: “For people leaving a service…”
- First click: **Try it with sample data**, with “Loads a sample receipt now.” beside it.
- One click opens `/demo`, showing the inventory and a persistent “Demo — sample data, nothing is saved” bar with reset and exit controls.

The first screen has one `h1`, a `main`, `lang="en"`, no horizontal overflow at 390 px, and three short privacy/offline/price facts.

## Release-blocking findings

### High — ordinary valid exports produce false or misleading receipts

- A valid 1,488,891-byte JSON array with 30,000 records was reported as **“Unreadable JSON”** and showed no record count. `decode()` truncates every text file at 1,000,000 bytes before parsing. Real service exports commonly exceed that boundary.
- The same unreadable JSON and malformed JSON both show **Readable files: 1** because the summary counts extensions, not successful parses.
- A valid CSV containing one quoted multiline record was reported as 2 records. CSV rows are counted by newline splitting instead of CSV parsing.
- The impossible date `2025-99-99` was accepted and presented as verified date coverage.

These errors defeat the core promise that a person can determine whether an export is complete, intelligible, and reusable.

### High — researched core scope is absent

The brief calls for pluggable inspectors for common exports and identification of missing or ambiguous categories. The implementation only classifies by file extension and cannot know which service categories should be present. The shipped demo reports **0 checks** and therefore does not demonstrate the success measure of finding at least one missing/ambiguous category. There are no vendor fixtures or inspector plugins.

### High — receipts are not signed

Both downloaded files were exercised successfully, but neither contains a signature, signer, verification data, or integrity signature. They only repeat the SHA-256 hash of the source archive. This does not meet the brief’s signed HTML/JSON receipt requirement.

### High — claim suite does not test its declared browser sandboxes

After `npm ci`, all four commands in `.factory/claims.json` exit 0. However, they call TypeScript functions or inspect source text; none uses the shipped `/demo` entry point in a browser:

| Claim | Command result | Contract problem |
|---|---|---|
| `sample-inventory` | PASS | Calls `sampleInspection()` directly; does not observe the demo UI. |
| `local-only` | PASS | Stubs `fetch` around `sampleInspection()` only; does not intercept the full browser/file/demo flow. |
| `json-receipt` | PASS | Serializes `receiptData()`; does not click or validate the downloaded file. |
| `offline-reload` | PASS | Searches `public/sw.js` for two strings; does not load, go offline, and reload. |

This violates the claims acceptance contract even though the selectors are green. The landing page and README also make unlisted, testable claims: HTML receipt download; ZIP/JSON/CSV/text acceptance; source hashing; unsafe-path and parse-error detection; no analytics; and free use.

For completeness, invoking the four claim commands before dependency installation failed with missing `node_modules/vitest/vitest.mjs`; after the required clean install, all passed as above.

### High — accessibility baseline fails

Axe on the live 390 px demo found serious violations:

- Light theme: insufficient contrast on **Download JSON receipt** and the horizontally scrollable inventory is not keyboard-focusable.
- Dark theme: insufficient contrast across demo controls, headings, summary values, findings, download control, inventory headers/cells, plus the non-focusable scroll region.
- Manual geometry found multiple interactive targets below 44 px: the theme control is 36 px high, demo controls 38 px, and footer links about 16 px high. Desktop navigation links are 24 px high.

Keyboard traversal itself works and focus uses a visible 4 px orange outline; no keyboard trap was found.

### High — hostile ZIP resource exhaustion is unbounded

`inspectFile()` reads the whole archive into memory and passes it to synchronous `unzipSync()` with no compressed size, expanded size, entry count, nesting, or time limits. A ZIP bomb or very large export can freeze/crash the main thread. Unsafe path text is flagged correctly, but the hostile-content constraint is not met.

## Other findings

### Medium

- Unknown routes return HTTP 200 and render the landing page (`/does-not-exist`), despite the required designed 404. The shipped `404.html` is not reached through the deployed fallback behavior.
- Root assets are unhashed and served with `Cache-Control: public, must-revalidate, max-age=30`; the configured immutable `/assets/*` rule matches none of `app.js`, `app.css`, or the hero image.
- `npm audit` reports 25 development-tool findings: 19 moderate, 5 high, and 1 critical (Vitest). `npm audit --omit=dev` reports zero runtime dependency findings.
- CSP, HSTS, referrer policy, and nosniff are present. CSP permits `'unsafe-inline'` styles, and no clickjacking policy (`frame-ancestors`/`X-Frame-Options`) is sent.

## Passing evidence

- Live/candidate identity: SHA-256 hashes match exactly for built `index.html`, `app.js`, `app.css`, `sw.js`, and `manifest.webmanifest`.
- `npm ci`: PASS.
- `npm test`: PASS, 5/5 tests.
- `npx tsc --noEmit`: PASS. No lint script exists.
- `npm run build`: PASS; `dist/` produced.
- Build sizes: JS 19.68 KB raw / 8.69 KB gzip; CSS 10.08 KB raw / 3.11 KB gzip; hero WebP 39.34 KB. Budgets pass.
- Lighthouse mobile `/demo`: performance 100, accessibility 96, best practices 100; LCP 1.1 s, TBT 50 ms, CLS 0. Axe findings above remain blocking.
- Live desktop and 390 px flows: no application console errors, page errors, or failed requests.
- Privacy: the complete demo flow contacted only `https://export-receipt.sociobot.in`; demo used no local/session storage. Theme preference is the only observed stored value.
- PWA manifest has no Chromium installability errors. Service worker controlled the page; live desktop/mobile and local production-preview `/demo` reloaded successfully while offline.
- Reduced-motion mode reduces transitions/animations to effectively instant values.
- Normal sample: 4 files, 2 JSON/CSV, 1 attachment, date range 2022-02-19–2025-01-08.
- Recovery: unsupported `.exe` remains on the picker and gives a clear next step; malformed JSON and hostile `../` ZIP paths are visibly flagged without a crash.
- JSON and HTML receipt buttons both create non-empty downloads.
- `/privacy` and `/terms` load. No sign-in or server API exists, so Entra and API rate-limit checks are not applicable.

## Commands used

```sh
npm ci
npm test -- --grep @claim:sample-inventory
npm test -- --grep @claim:local-only
npm test -- --grep @claim:json-receipt
npm test -- --grep @claim:offline-reload
npm test
npx tsc --noEmit
npm run build
npm audit --json
npm audit --omit=dev --json
```

Browser checks used Chromium 1208 through Puppeteer against the live site and local `vite preview`, plus injected axe-core 4.10.3 and Lighthouse 12.8.2.
