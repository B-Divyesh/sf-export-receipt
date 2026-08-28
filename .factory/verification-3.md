# Independent product verification — PASS

**Candidate:** `2cf61ff312e27d5a4710043f7a95db0e74b0c5c5`
**Live URL:** <https://export-receipt.sociobot.in>
**Verified:** 2026-08-28 UTC
**Verdict:** **PASS — candidate is releasable.**

The live deployment matches a fresh production build of the requested commit. SHA-256 matches for `index.html`, `sw.js`, `manifest.webmanifest`, the application JS, CSS, and hero WebP. No product-code changes were made during this verification.

## Required first checks

### Claims registry and sandbox tests — PASS

`.factory/claims.json` is present and contains 12 claims. After `npm ci`, I ran every exact registered command separately through the production-build demo entry point. All passed:

| Claim ID | Result |
|---|---|
| `sample-inventory` | PASS |
| `local-only` | PASS |
| `json-receipt` | PASS |
| `html-receipt` | PASS |
| `supported-formats` | PASS |
| `source-hash` | PASS |
| `parse-errors` | PASS |
| `offline-reload` | PASS |
| `account-free` | PASS |
| `preference-storage` | PASS |
| `demo-isolation` | PASS |
| `safe-archive-limits` | PASS |

The tests exercise the shipped `/demo` sample and observable outcomes, including signed downloads, privacy request capture, a fresh offline reload, demo-memory isolation, all listed formats, unsafe ZIP paths, and source/entry/expanded-size/ratio/text-size limits.

### Cold first-read test — PASS

On a cold 390px live load, the first screen says **“Check your export before access ends”**. It says this is **“For people leaving a service”** and offers **“Try it with sample data”** with **“Loads a sample receipt now.”** beside it. This plainly states what it does, for whom, and what to do first.

One click opened `/demo` and immediately showed a receipt with four inventoried files, one attachment, date coverage `2022-02-19` to `2025-01-08`, and **Missing category: Profile**. The persistent banner says **“Demo — sample data, nothing is saved”** and supplies **Reset demo** and **Start for real**.

## Local quality gates — PASS

```sh
npm ci                 # PASS; 0 vulnerabilities
npm test               # PASS; 7 unit tests and production-browser suite
npm run lint           # PASS; tsc --noEmit
npm run build          # PASS; dist/ produced
npm audit --omit=dev   # PASS; 0 vulnerabilities
npm audit              # PASS; 0 vulnerabilities
```

Build output is within budget: app JS `20.06 kB` raw / `8.06 kB` gzip, worker JS `11.32 kB` raw, CSS `10.73 kB` raw / `3.25 kB` gzip, and hero WebP `39.34 kB`.

Live Lighthouse mobile `/demo`: Performance **93**, Accessibility **100**, Best Practices **100**; FCP `1.0 s`, LCP `1.1 s`, CLS `0`.

## End-to-end evidence — PASS

- Normal sample: inventory, category warning, attachment count, coverage, source hash, JSON receipt, and demo reset/exit worked.
- Boundary CSV: valid leap date `2024-02-29` established coverage; invalid `2025-99-99` did not.
- Invalid/recovery: malformed JSON displayed **Unreadable JSON: broken.json** and a concrete next step; **Check another export** then accepted a valid CSV with `2025-01-08` coverage.
- Browser claim coverage separately passed ZIP, JSON, CSV, and text inputs; hostile paths and all documented archive limits were rejected safely.
- JSON receipt download contained a local-browser ECDSA signature and retest checklist; the claim test verifies the signature with its included public JWK. HTML receipt includes signer and signature evidence.

## Live deployment, privacy, accessibility, and PWA — PASS

- `/`, `/demo`, `/privacy`, `/terms`, `/manifest.webmanifest`, `/sw.js`, `/offline.html`, and `/404.html` return 200. An unknown URL renders the designed page with HTTP 404. All discovered internal links resolve.
- Live root has title `Export Receipt — Check your data export`, `lang="en"`, one `h1`, a `main` landmark, alt text, and no load console/page errors. `/opt/fleet/lib/verify-url.sh` passed (597 ms observed page load).
- Fresh keyboard navigation starts at `BODY`; first Tab reaches **Skip to inspection** with a visible `rgb(255, 112, 67)` 4px outline. SPA navigation moves focus to the new page `h1`.
- Playwright axe found **zero serious or critical violations** in light and dark 390px demo views. No visible buttons or links were below 44px. At 390px, `scrollWidth == clientWidth == 390`. Reduced-motion transition duration was `1e-05s`.
- A fresh live demo context had no localStorage, sessionStorage, or IndexedDB entries. With request logging through landing, demo, archive inspection, and downloads, every request was same-origin; there were no credentials, cookies, XHR, non-GET API calls, analytics, payment, or sign-in traffic. Entra and API-rate-limit checks are not applicable to this static local-only product.
- The live manifest declares standalone display, matching colors, maskable 192/512 icons, and `/?v=1` start URL. The service worker was registered and controlling `/demo`; after initial online load it reloaded offline with the complete sample receipt. The deployed worker uses versioned precache names plus `skipWaiting()` and `clients.claim()`, and the app listens for `updatefound` to offer a reload. A genuine changed-worker rollout cannot be induced against this fixed deployment, so the update path was code-inspected while the active-worker/offline path was exercised.
- Headers on HTML and assets include CSP (`default-src 'self'` and same-origin `connect-src`), HSTS, `X-Content-Type-Options: nosniff`, and strict referrer policy. Hashed assets have `Cache-Control: public, max-age=31536000, immutable`.

## Defects by severity

None found. There are no release-blocking defects.

## Evidence locations

- `/tmp/export-receipt-verify-url/verify.json`
- `/tmp/export-receipt-verify-url/screenshot-desktop.png`
- `/tmp/export-receipt-verify-url/screenshot-mobile.png`
- `/tmp/export-receipt-lighthouse.json`
