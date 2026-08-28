# Polish round 2 — zero-finding closure

Repair candidate: `7ce9f7d7599ed7833cf87f40b9e5b4672bda3a01`. Reviewed reports: `.factory/review-1.md` and `.factory/review-2.md` (with the associated prior verification and polish records).

| Finding ID | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept the precached shell navigation path and its true one-visit offline demo assertion. | `@claim:offline-reload`; full `npm test`. |
| F-1-2 | Kept demo color changes in memory and asserted that reset/exit preserve real storage byte-for-byte. | `@claim:demo-isolation`; full `npm test`. |
| F-1-3 | Kept the CSP-safe, receipt-styled static 404 with the shared accessibility controls. | Full browser suite 404 + axe check; `artifacts/404-local.png`. |
| F-1-4 | Kept `?demo=1` redirecting into the isolated `/demo` sample route. | `@claim:demo-isolation`; full `npm test`. |
| F-1-5 | Kept the mobile copy-before-art layout and first-viewport assertion. | Full browser suite; `artifacts/mobile-first-screen.png`. |
| F-1-6 | Kept the route-specific empty `/receipt` state with real start actions. | Full browser route metadata check. |
| F-1-7 | Kept per-route title, description, canonical, Open Graph, and Twitter metadata assertions. | Full browser route metadata check. |
| F-1-8 | Kept named Harbor Mail, Google Takeout, and Meta Download category fixtures. | `@claim:recognized-layouts`. |
| F-1-9 | Kept local JSON receipt verification and valid/tampered receipt results. | `@claim:receipt-verification`. |
| F-1-10 | Kept **export** as the visitor-facing input term. | `.factory/copy-audit.md`; browser copy/claim annotation check. |
| F-1-11 | Kept result-naming color controls. | `@claim:preference-storage`. |
| F-1-12 | Kept the short README audience copy. | `.factory/copy-audit.md`. |
| F-1-13 | Kept the short README feature copy and named-layout claim. | `.factory/copy-audit.md`; `@claim:recognized-layouts`. |
| F-1-14 | Kept the short README safety-limit copy. | `.factory/copy-audit.md`; `@claim:safe-archive-limits`. |
| F-1-15 | Kept the short README test-coverage copy. | `.factory/copy-audit.md`; full `npm test`. |
| F-2-1 | Restored compact, visible 44 px **Demo** and **Privacy** links at 390 px; the secondary “How it works” anchor is intentionally hidden only at this compact breakpoint. Added a regression that measures both links and follows each route. | Full production-browser suite; `artifacts/mobile-first-screen.png`; local `http://127.0.0.1:4173/` during test. |

All claim commands, quality gates, a clean-clone run, and the live re-check are recorded in `.factory/handoff.md`.
