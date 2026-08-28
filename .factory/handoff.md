# Export Receipt polish round 5 handoff

## Result

All 28 cumulative findings in `.factory/review-1.md` through `.factory/review-5.md` are closed. The finding-by-finding record is `.factory/polish-5.md`. The neo-brutalist archive-workbench identity and `pwa-offline` artifact class are unchanged.

The repaired product is live at <https://export-receipt.sociobot.in>. Product repair commit: `58e5f62c1808939bebfad1148f17edb23c741f36`. The existing Azure Static Web App production environment reported Ready after upload at `2026-08-28T22:58:22.015388+00:00`.

## What changed

- The service worker now gives the cached application shell only to the five declared app routes.
- Unknown controlled navigations reach the static host and preserve its HTTP 404 response.
- The designed 404 is also precached as the worker's offline fallback for an unknown route.
- The permanent browser suite now activates the worker before opening an unknown path. It asserts status 404, the heading, shared navigation, skip link, axe result, and unexpected-console-error count.
- Local preview routing now models Static Web Apps 404 behavior, so the controlled-worker defect is reproducible before deployment.
- The release is v1.0.3. The catalog description is a 103-character verb-first sentence.

All prior fixes remain in place: one-click isolated `?demo=1`, exact sample ZIP hashing, truthful bundled-signature wording, privacy/offline/price facts, route metadata and focus, legal links, mobile layout, accessible controls, safe ZIP boundaries, and the product-specific archive-workbench visual system.

## Verification

A fresh clone of repair commit `58e5f62c1808939bebfad1148f17edb23c741f36` used `npm ci`. All 14 registered claim commands passed separately:

`sample-inventory`, `local-only`, `json-receipt`, `html-receipt`, `supported-formats`, `source-hash`, `parse-errors`, `offline-reload`, `account-free`, `preference-storage`, `demo-isolation`, `safe-archive-limits`, `recognized-layouts`, and `receipt-verification`.

The same clean clone passed:

```text
npm test
npm run lint
npm run build
npm audit
npm audit --omit=dev
```

`npm test` ran nine Vitest regressions and the full production-browser suite. The browser suite includes all claims, demo isolation, privacy request logging, responsive layout, keyboard focus, route metadata, both color modes, axe, offline reload, cold 404, and controlled-PWA 404. `npm run build` produced `dist/index.html`.

Additional evidence:

- Local dedicated sweep: `artifacts/local-polish-5/polish-5-verify.json` — pass, zero unexpected console errors.
- Live dedicated cold sweep: `artifacts/live/polish-5/polish-5-verify.json` — pass, including true HTTP 404 after service-worker activation.
- Local factory URL verifier: `artifacts/local-polish-5/verify-url/verify.json` — pass.
- Live factory URL verifier: `artifacts/live/polish-5/verify-url/verify.json` — pass in 878 ms with title, `lang=en`, one h1, main, image alt text, and no console errors.
- Local Lighthouse `/demo`: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.6 s, CLS 0, TBT 40 ms.
- Live Lighthouse `/demo`: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.2 s, CLS 0, TBT 20 ms.
- Build sizes: app JavaScript 25.02 kB raw / 10.06 kB gzip; worker 11.67 kB raw; CSS 12.30 kB raw / 3.58 kB gzip; hero WebP 39.34 kB.
- Live/local SHA-256 match: `index.html` `d3bd8e66f385222680004d05bd28df0602526687307ccd246f2e9c37f119f79f`; `sw.js` `8a448a07c5d94f1f2cc7e48dde67be98d4666920852e13442dbbfd710390e546`.
- Every declared route and public asset returned 200. A cold unknown URL and an unknown URL opened after worker control both returned 404.
- Live screenshots and reports are under `artifacts/live/polish-5/`; local equivalents are under `artifacts/local-polish-5/`.

## Run and verify

```sh
npm ci
npm test
npm run lint
npm run build
npm run verify:live -- https://export-receipt.sociobot.in artifacts/live/polish-5
```

## Known gaps and next steps

None. No review finding, untested claim, stub, or deferred severity remains.
