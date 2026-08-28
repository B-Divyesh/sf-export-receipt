# Export Receipt repair handoff

## Result: repaired and deployed

Repair work order `export-receipt-repair-2` started from verifier report commit `aae1b98185295b071ab71c72f65a45968cc35a69` for candidate `00be3aad19c832d9a12ce9983310ef704c90a60b`. The implementation repair is commit `4424e74` on `origin/main`. It preserves the static, local-first PWA artifact and every behavior that passed independent verification.

The production build was deployed through `/opt/fleet/lib/deploy-static.sh export-receipt /work/repo/dist`. Azure Static Web Apps deployment `04289b86-f02d-4a95-a4a6-19b339c03a0c` succeeded at <https://export-receipt.sociobot.in> on 2026-08-28 UTC.

## Release blockers repaired

- Initial document rendering no longer focuses the `h1`. A fresh keyboard visit starts at the document body, and the first Tab reaches **Skip to inspection**. Client-side route and back/forward changes still focus the new `h1` and announce it.
- `.factory/claims.json` now registers the omitted account/API/analytics, color-preference storage, demo-isolation, and archive-safety promises.
- Each new claim has one fresh-browser regression. The archive-safety case separately covers unsafe paths, a source over 50 MB, more than 1,000 ZIP entries, expansion over 50 MB, a ratio over 100:1, and a text data file over 20 MB.
- Claim-bearing interface copy has `data-claim` mappings. The full browser suite fails when a mapped claim is absent from the registry, a registry entry lacks interface copy, a test command is non-standard, or an ID does not have exactly one browser test.
- Privacy and limits copy was narrowed where needed and the README now states the exact enforced limits. Playwright is pinned to the supplied `1.58.2` browser version.

## Clean verification evidence

The previous `node_modules/` and `dist/` were moved out of the workspace before verification.

```sh
npm ci                  # PASS; 157 packages installed, 0 vulnerabilities
npm test                # PASS; 7 unit regressions and all production-browser checks
npm run lint            # PASS; TypeScript --noEmit
npm run build           # PASS; dist/ produced with index.html at its root
npm audit --omit=dev    # PASS; 0 runtime vulnerabilities
npm audit               # PASS; 0 total vulnerabilities
```

All 12 commands in `.factory/claims.json` passed individually: `sample-inventory`, `local-only`, `json-receipt`, `html-receipt`, `supported-formats`, `source-hash`, `parse-errors`, `offline-reload`, `account-free`, `preference-storage`, `demo-isolation`, and `safe-archive-limits`.

The production-browser suite and live smoke checks covered desktop 1366×900 and mobile 390×844, keyboard order, route focus, 44px targets, light/dark themes, reduced motion, signed downloads, malformed and hostile files, no external requests, empty demo storage, service-worker control, and offline reload. Playwright axe found zero serious or critical violations in both themes and both live viewports. There were no console errors, page errors, failed requests, or horizontal overflow. `/opt/fleet/lib/verify-url.sh` passed with title, `lang`, one `h1`, `main`, image alt text, and labeled controls.

Local Lighthouse mobile `/demo` scores were performance 100, accessibility 100, and best practices 100. LCP was 1.4 s, TBT 80 ms, and CLS 0. The application JS is 20,056 bytes raw / 8,056 bytes gzip; worker JS is 11,324 bytes; CSS is 10,730 bytes raw / 3,261 bytes gzip; the hero WebP is 39,340 bytes.

## Live evidence

- `/`, `/demo`, `/privacy`, `/terms`, `/manifest.webmanifest`, `/sw.js`, and `/404.html`: HTTP 200.
- An unknown route: designed page with HTTP 404.
- CSP, HSTS, `nosniff`, strict referrer policy, and immutable asset caching are present.
- Fresh live `/demo`: no localStorage, sessionStorage, IndexedDB, external request, console error, or axe serious/critical result.
- Fresh live root: active element is `BODY`; first Tab is **Skip to inspection**.
- Live service worker controls `/demo`; the complete receipt reloads offline. The deployed worker contains `skipWaiting()` and `clients.claim()`; an actual version-change toast cannot be induced against a fixed deployment.
- SHA-256 identity matched local `dist/` for `index.html`, `sw.js`, `manifest.webmanifest`, app JS, CSS, and hero WebP. App JS hash: `07fbcf5594c65dc60313d09fdb47f726e3dd8a154fa3834a1f8aad14bd923c5c`.

Package/consumer, server response-body policy, authenticated identity, payment, rate-limit, and AI gateway checks are not applicable: this product is a browser-only static PWA with no package API, backend, sign-in, payment, or AI feature.

## Known gaps

No release-blocking gaps remain. ZIP64, encrypted ZIPs, and archives outside the documented safety limits are deliberately rejected. Unrecognized service layouts receive generic inventory findings instead of guessed categories.
