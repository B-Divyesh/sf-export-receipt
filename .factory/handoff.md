# Export Receipt polish round 4 handoff

## Result

All 27 cumulative findings in `.factory/review-1.md` through `.factory/review-4.md` are closed. The finding-by-finding record is `.factory/polish-4.md`. The neo-brutalist archive-workbench identity and `pwa-offline` artifact class are unchanged.

The repaired product is at <https://export-receipt.sociobot.in>. Product repair commit: `87289df03b1c0ff0706694e702ec12ca2b9e2013`.

## What changed

- The sample is one deterministic 869-byte Harbor Mail ZIP bundled with the app. Demo inspection uses the same `inspectFile()` path as a real export.
- The full sample SHA-256 is `312216e21b560a39c5bfac1b493917144b901fd25d1504777f0eaa462bc8b6c5`. Browser tests recompute it and compare the UI, JSON, and HTML receipts.
- JSON checking now promises only what its bundled key proves. The UI states that it cannot identify the signer or detect editing followed by re-signing.
- The replacement-key adversarial fixture edits and re-signs a receipt. The product never labels that file unchanged or attributes it to the current browser.
- The first screen now states privacy, offline use, and price directly. Its complete action and fact row end at 599 px on a 390 × 844 viewport.
- Every route and static status page uses **Skip to main content**. Route titles, metadata, focus behavior, links, legal pages, and the designed HTTP 404 remain covered.
- ZIP error wording matches the implemented boundaries. Exactly 1,000 entries and exactly 50 MB expanded data pass; values above either boundary fail.
- Singular receipt counts were corrected. The catalog description is verb-first and 105 characters.

## Verification

A fresh clone at the repaired commit used `npm ci`. All 14 registered claim commands passed separately:

`sample-inventory`, `local-only`, `json-receipt`, `html-receipt`, `supported-formats`, `source-hash`, `parse-errors`, `offline-reload`, `account-free`, `preference-storage`, `demo-isolation`, `safe-archive-limits`, `recognized-layouts`, and `receipt-verification`.

The clean clone also passed:

```text
npm test
npm run lint
npm run build
npm audit
npm audit --omit=dev
```

`npm test` ran 9 Vitest regressions and the full production-browser suite. `npm run build` produced `dist/index.html`. Build sizes: app JavaScript 25.02 kB raw / 10.06 kB gzip; worker 11.67 kB raw; CSS 12.30 kB raw / 3.58 kB gzip; hero WebP 39.34 kB.

Additional evidence:

- Local factory URL verifier: pass with no console errors — `artifacts/local-polish-4/verify-url/verify.json`.
- Local dedicated route/browser/axe/privacy/offline suite: pass — `artifacts/local-polish-4/polish-4-verify.json`.
- Local Lighthouse `/demo`: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, CLS 0, TBT 120 ms — `artifacts/local-polish-4/lighthouse.json`.
- Live factory URL verifier: `artifacts/live/polish-4/verify-url/verify.json`.
- Live dedicated cold-check suite: `artifacts/live/polish-4/polish-4-verify.json`.
- Live screenshots: `artifacts/live/polish-4/`.

Run locally with `npm ci && npm run dev`. Recheck with `npm test && npm run lint && npm run build`. Recheck production with `npm run verify:live -- https://export-receipt.sociobot.in artifacts/live/polish-4`.

## Known gaps and next steps

None. No finding, TODO, stub, or deferred severity remains.
