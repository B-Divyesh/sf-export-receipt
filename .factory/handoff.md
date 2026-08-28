# Export Receipt repair handoff

## Result: repaired

This repair starts from verifier commit `f0c6340dbe8caa0f268188ee6d19e9eac229f93f` and preserves the static PWA/local-first deployment class. Every release-blocking finding in `.factory/verification.md` was reproduced from the original source and repaired.

Repair commit `73394b4c8a35ce0ceb0c389afc645f76c886e539` was pushed to `origin/main`. The work order supplies only the `static` deployment class: this repository has no deploy script, Static Web Apps token, Azure resource target, or GitHub Actions deployment workflow. At 2026-08-28 16:31 UTC the public URL still served the prior `app.js` build (last modified 15:17 UTC), so the factory static publisher had not propagated the pushed commit yet. No infrastructure, DNS, or billing configuration was changed.

## What changed

- Full bounded parsing replaces the 1 MB truncation. Valid 30,000-record JSON now parses completely; successful parse state, not extension, determines the readable-file count.
- CSV counting now handles quoted multiline fields. Date coverage accepts only real calendar dates.
- Added data-only, pluggable inspectors for Harbor Mail sample exports, Google Takeout, and Meta downloads. Recognized layouts report expected categories, including the sample's visible missing Profile category.
- ZIP central-directory metadata is checked before decompression (50 MB source/expanded caps, 1,000 entries, 100:1 expansion ratio) and decompression runs in a module worker.
- JSON and HTML downloads now include a locally generated ECDSA P-256 signature, signer identity, public JWK, algorithm, and timestamp. The browser regression verifies the JSON signature using the included public key.
- Replaced source-only claim tests with Chromium tests against `/demo` and the production build. Claims cover demo inventory, local-only upload flow, signed downloads, supported input, source hash, parse errors, and offline reload.
- Repaired dark-mode contrast, keyboard focusability of the horizontal inventory, and 44px interactive targets. The browser suite runs axe at 390px in light and dark themes.
- Hashed application/image assets are now emitted under `/assets/` and precached from Vite's manifest. Static Web Apps known routes rewrite to the app; unknown paths reach the designed 404. CSP no longer allows inline styles and adds `frame-ancestors 'none'`.
- Updated Vitest and Lighthouse development tooling; `npm audit` now reports zero vulnerabilities.

## Verification evidence (2026-08-28 UTC)

```sh
npm ci                              # PASS; 158 packages, 0 audit vulnerabilities
npm test                            # PASS; 7 parser regressions + production-browser suite
npm test -- --grep @claim:sample-inventory   # PASS
npm test -- --grep @claim:local-only         # PASS
npm test -- --grep @claim:json-receipt       # PASS; downloaded signature verifies
npm test -- --grep @claim:html-receipt       # PASS
npm test -- --grep @claim:supported-formats  # PASS
npm test -- --grep @claim:source-hash        # PASS
npm test -- --grep @claim:parse-errors       # PASS
npm test -- --grep @claim:offline-reload     # PASS; controlled page reloads offline
npm run lint                       # PASS (TypeScript no-emit)
npx tsc --noEmit                   # PASS
npm run build                      # PASS; dist/ produced
npm audit --omit=dev --json        # PASS; 0 runtime vulnerabilities
```

Browser checks use pinned `playwright@1.58.2`, production `vite preview`, desktop plus 390×844 mobile, keyboard focus, visible focus, 44px targets, no serious/critical axe violations in light or dark mode, local-only network observation, signed downloads, and service-worker offline reload. Production output is 19.50 KB raw JavaScript (7.90 KB gzip), 10.73 KB CSS (3.25 KB gzip), and 39.34 KB hero image.

There is no repository `verify-url.sh`; its title/lang/main/alt/console equivalents are covered by the production browser suite and static document review. No server API, sign-in, payment, AI feature, or external runtime request exists, so response-policy, live-identity, rate-limit, and AI gateway checks are not applicable.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run build
```

Deploy `dist/` as the existing static web app. The included `staticwebapp.config.json` carries its route, cache, and security-header policy.

## Known gaps

The browser deliberately rejects ZIP64, encrypted ZIPs, and exports beyond the stated safe limits instead of risking device memory. The new inspector list is extensible but cannot infer categories for an unrecognized service layout; it says so rather than guessing.
