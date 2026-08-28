# Independent product verification — FAIL

**Candidate:** `00be3aad19c832d9a12ce9983310ef704c90a60b`  
**Live URL:** <https://export-receipt.sociobot.in>  
**Verified:** 2026-08-28 UTC  
**Verdict:** **FAIL — do not release until the claim registry and keyboard-start behavior are corrected.**

The deployed application is the tested candidate: SHA-256 matched exactly for `index.html`, app JS, CSS, `sw.js`, and the manifest. Core inspection, privacy, offline use, accessibility automation, and the declared claim tests all pass. This remains a release failure because the factory claims contract requires *every* visitor-facing claim to be registered and tested, and several are not. Keyboard users also start after the header/skip link because the app focuses the page heading on initial load.

## First-read test — PASS

A cold live load plainly answers all three mandatory questions:

- **What it does:** “Check your export before access ends.”
- **For whom:** “For people leaving a service, see what your archive contains before an account disappears.”
- **What to click first:** **Try it with sample data**, followed by “Loads a sample receipt now.”

The one-click action opens `/demo`, immediately shows the receipt and a persistent **“Demo — sample data, nothing is saved”** bar with **Reset demo** and **Start for real**. The sample showed four files, one attachment, date coverage `2022-02-19` through `2025-01-08`, and **Missing category: Profile**. Desktop and 390×844 mobile were visually sound; mobile had no horizontal page overflow.

## Release-blocking findings

### High — unregistered, untested visitor claims

`.factory/claims.json` has eight well-formed, passing entries, but it does not list every claim visitors are asked to rely on. The claims skill explicitly makes this a review failure until the statements are removed or have one tagged sandbox test each.

Unlisted examples include:

- Landing: **“No account needed.”**
- Landing limits: **“It does not log in, scrape accounts, move data, or decide legal compliance.”**
- Privacy page / README: **“does not … use accounts, or run analytics”**, **“has no account, analytics, server API”**, and **“Color mode is the only browser preference it stores.”**
- Demo documentation and persistent banner: demo data is memory-only / **“nothing is saved.”**
- README: unsafe-path detection and source/entry/expansion/text-size safety limits.

The existing `local-only` browser test proves that one upload makes no *external* request, but it does not prove the no-account/no-analytics/no-server-API/storage guarantees or demo storage isolation. Add exact claims and fresh-browser observable tests, or remove/narrow the copy. This is release-blocking even though every declared claim command is green.

### Medium — initial keyboard focus bypasses the header and skip link

`shell()` focuses the current `h1` on every render, including the first document load. On a fresh keyboard-only visit, the initial active element is the `h1`; successive forward Tabs reach the sample button, file picker, and footer, then wrap to the skip link and header navigation. The visible skip link exists and works once reached, and focus styling is clear, but it should be the first forward-Tab target on initial load. Restrict automatic heading focus to client-side route changes, not the initial load.

## Claim results — all declared tests pass

After `npm ci`, each command in `.factory/claims.json` was executed individually through the production-build Chromium demo entry point:

| Claim | Result |
|---|---|
| `@claim:sample-inventory` | PASS |
| `@claim:local-only` | PASS |
| `@claim:json-receipt` | PASS |
| `@claim:html-receipt` | PASS |
| `@claim:supported-formats` | PASS |
| `@claim:source-hash` | PASS |
| `@claim:parse-errors` | PASS |
| `@claim:offline-reload` | PASS |

The suite genuinely uses `/demo` / browser uploads. The live JSON download was also independently verified: 2,363 bytes, ECDSA P-256 signature valid using the included public JWK, signer `Export Receipt local browser`, four retest checks; the HTML receipt included the signer and signature evidence.

## Passing evidence

### Local quality and build

```sh
npm ci                 # PASS; 0 audit vulnerabilities
npm test               # PASS; 7 unit regressions + production browser checks
npm run lint           # PASS (tsc --noEmit)
npm run build          # PASS; dist/ produced
npm audit --omit=dev   # PASS; 0 runtime findings
npm audit              # PASS; 0 total findings
```

The production app JS is 19,498 bytes raw / 7,900 bytes gzip; its worker is 11,324 / 5,243 bytes; CSS is 10,730 / 3,256 bytes; the hero WebP is 39,340 bytes. These are within the static-PWA budgets.

### End-to-end cases on the live candidate

- Normal demo receipt: inventory, attachment, valid coverage, missing category, source hash, JSON/HTML downloads, and reset/exit controls all worked.
- Boundary CSV: quoted multiline field counted as two records; impossible `2025-99-99` did not enter date coverage, while `2024-02-29` did.
- Invalid/recovery paths: malformed JSON gave **Unreadable JSON** plus a next-step warning; an unsupported `.exe` gave a clear error and then accepted a valid JSON selection without reload.
- Hostile content: a ZIP central directory patched to advertise more than 50 MB expanded data was rejected before decompression with the stated safe-limit message.
- No live console errors, page errors, failed requests, or external requests were observed through landing, demo, upload, and downloads.

### Accessibility, PWA, privacy, and policy

- Live root has `lang="en"`, title, one `h1`, `main`, image alt text, a visible skip link, and a designed 4 px focus outline. Axe Playwright found **zero serious/critical** violations in light and dark 390 px demo views. Visible controls met 44 px targets; the apparent hidden update button has 0×0 geometry and was excluded.
- `prefers-reduced-motion: reduce` yielded `0.00001s` transitions. Mobile `scrollWidth === clientWidth === 390`.
- A fresh live `/demo` context had no local/session storage after demo loading. The observed complete flow contacted only the product origin. No sign-in, server API, payment, or AI endpoint exists; therefore Entra and API rate-limit tests are not applicable.
- The live service worker was active and controlled the page. After an online reload, a 390 px `/demo` reload succeeded offline with the receipt still rendered and no console errors. The registration contains the expected update listener/toast and `skipWaiting`/`clientsClaim`; a true version-change update could not be induced against the fixed production deployment.
- Live headers include HSTS, `nosniff`, strict referrer policy, and CSP with `frame-ancestors 'none'`; app assets use `Cache-Control: public, max-age=31536000, immutable`. `/`, `/demo`, `/privacy`, `/terms`, PWA files, and `/404.html` were 200; an unknown route returned the designed 404 with HTTP 404.

An attempted Lighthouse 13.4.1 run could not complete because its Chrome launcher crashed/failed to connect to the container's Chrome-for-Testing 145 process. This is a verifier-tooling limitation, not counted as product evidence; the bundle and browser checks above were completed instead.

## Required next steps

1. Add claim IDs and fresh-demo/browser tests for every listed unregistered promise (or remove the promises), then run every resulting claim command from a clean install.
2. Do not focus the page `h1` during initial load; preserve heading focus for SPA route transitions only. Re-run a fresh keyboard-tab order test.
3. Repeat this independent verification against the newly deployed commit.
