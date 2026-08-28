# Export Receipt polish round 1 handoff

## Result: PASS

Repair commit: `7a98fb922612306a3ea977d3e0315b306f1b2f79` (`fix: close adversarial review findings`). It is pushed to `origin/main` and was deployed with `/opt/fleet/lib/deploy-static.sh export-receipt dist` on 2026-08-28 UTC. Azure deployment `e26417b0-2045-4877-abe3-62556d5c6d06` succeeded.

## What changed

- Fixed first-visit offline navigation, complete demo isolation including color mode, and direct `?demo=1` entry.
- Added live receipt verification, supported-layout fixtures and ambiguity detection, empty `/receipt`, per-route metadata, and a CSP-safe designed 404.
- Rewrote user copy around the single term **export**, shortened README copy, made theme actions explicit, and moved mobile hero art below all first-screen essentials.
- Added complete claim coverage, route/mobile/404 browser checks, screenshots, catalog copy, and review mapping in `.factory/polish-1.md`.

## Exact verification evidence

- Clean clone `/tmp/export-receipt-clean.fjBAFE/repo`: `npm ci`, then every command listed in `.factory/claims.json` separately. All 14 claim commands passed.
- Workspace: `npm test` passed: 8 Vitest regressions plus Chromium claim, privacy, offline, keyboard, metadata, mobile, 404, and Playwright axe checks.
- `npm run lint`, `npm run build`, and `npm audit --omit=dev --audit-level=high` passed. Build output is `dist/`; app JS is 23.62 kB raw / 9.06 kB gzip; CSS is 11.46 kB raw / 3.39 kB gzip.
- Live: `/opt/fleet/lib/verify-url.sh https://export-receipt.sociobot.in artifacts/live` passed with no console errors, one `h1`, `lang=en`, a main landmark, and image alt text. See `artifacts/live/verify.json`.
- Live Playwright re-check passed: query demo, one-visit offline reload, metadata routes, `/receipt`, HTTP 404 page, and axe serious/critical checks in both modes. Screenshots: `artifacts/live/live-demo-mobile.png`, `artifacts/live/live-404-mobile.png`.
- `curl https://export-receipt.sociobot.in/does-not-exist` returned HTTP 404 with the deployed CSP; evidence is `artifacts/live/404.headers`.
- Lighthouse live mobile: performance 100, accessibility 100, LCP 1163.44 ms, CLS 0. See `artifacts/live/lighthouse.json`.

The standalone axe CLI could not locate a system Chrome binary in this container. The product was instead checked with the shipped Playwright Chromium and `@axe-core/playwright` locally and against production, with zero serious or critical violations.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run build
/opt/fleet/lib/deploy-static.sh export-receipt dist
```

## Known gaps

None. The product remains a static local-first PWA; it has no server API, account, analytics, or third-party runtime dependency.
