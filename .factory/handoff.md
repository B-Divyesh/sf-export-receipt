# Export Receipt polish 2 handoff

## Result

Released the zero-finding repair for review candidate `7ce9f7d7599ed7833cf87f40b9e5b4672bda3a01`. The repair commit is `c6f34d2e4c23f83ca45a163d2cf7e44b558408d3` (`fix: restore mobile receipt navigation`), deployed to <https://export-receipt.sociobot.in>.

The 390 px header now retains compact, 44 px **Demo** and **Privacy** controls. The less urgent same-page **How it works** anchor remains available on desktop and is deliberately omitted only at the compact breakpoint. The existing receipt-workbench identity, demo sandbox, local-only processing, PWA, and routing system were preserved.

## Verification

- Clean clone: `/tmp/export-receipt-clean.2zC9rh/repo` at `c6f34d2e4c23f83ca45a163d2cf7e44b558408d3`; `npm ci` reported 0 vulnerabilities.
- Every exact registry command was run separately from that clone and passed: `sample-inventory`, `local-only`, `json-receipt`, `html-receipt`, `supported-formats`, `source-hash`, `parse-errors`, `offline-reload`, `account-free`, `preference-storage`, `demo-isolation`, `safe-archive-limits`, `recognized-layouts`, and `receipt-verification`.
- Full clean-clone `npm test` passed (8 unit tests plus the production-browser suite). `npm run lint`, `npm run build`, and `npm audit --omit=dev --audit-level=high` passed. Build output is `dist/`; app JS is 23.62 kB raw / 9.06 kB gzip and CSS is 11.61 kB raw / 3.44 kB gzip.
- Browser suite covered 390 px first-screen geometry, header navigation targets/routes, keyboard start and route focus, demo isolation, request privacy, formats, hostile archive limits, signed downloads/verification, routing/metadata/404, service-worker offline reload, and axe serious/critical checks in light and dark modes.
- Deployed with `/opt/fleet/lib/deploy-static.sh export-receipt /work/repo/dist`; Static Web Apps deployment `dcb31a19-024f-4e56-b703-f87440ab2f56` succeeded.
- Cold live verification passed: `/opt/fleet/lib/verify-url.sh` reported 200, 614 ms load, no console errors, `lang="en"`, one h1, main landmark, and image alt text. Evidence: `/tmp/export-receipt-polish-2-live/verify.json`, `screenshot-desktop.png`, and `screenshot-mobile.png`.
- Fresh live Chromium checks passed for 44 px mobile Demo/Privacy links; `?demo=1` redirect, banner, reset, and real-data exit; storage isolation; offline `/demo` reload; route-specific metadata and HTTP 404; and axe serious/critical checks in both themes.

## Notes

No known product gaps remain. Pre-existing `graphify-out/` working-tree changes were left untouched.
