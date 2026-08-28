# Polish round 1 — finding closure

Candidate repaired from `2cf61ff312e27d5a4710043f7a95db0e74b0c5c5`; reviewed report at `4d2eead27c869292713da4f288f042133e6445e0`; repair `7a98fb922612306a3ea977d3e0315b306f1b2f79`.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Navigation requests now use the precached app shell; the test loads `/demo` once, waits for service-worker control, then reloads offline. | `@claim:offline-reload`; live Playwright offline check at `https://export-receipt.sociobot.in/?demo=1`. |
| F-1-2 | Demo color changes are memory-only. Reset and exit leave a seeded real theme key unchanged. | `@claim:demo-isolation`; live demo screenshot `artifacts/live/live-demo-mobile.png`. |
| F-1-3 | Replaced CSP-blocked inline 404 styling with `status.css`, shared header/footer, skip link, focus treatment, and 44px controls. | Browser 404/axe check; live `https://export-receipt.sociobot.in/does-not-exist` is HTTP 404; `artifacts/live/live-404-mobile.png`. |
| F-1-4 | `?demo=1` replaces to `/demo` and seeds the same isolated sample. | `@claim:demo-isolation`; live `https://export-receipt.sociobot.in/?demo=1`. |
| F-1-5 | On phones the copy, action outcome, and facts come before art; a 390×844 browser assertion guards the full first screen. | `npm test`; `artifacts/mobile-first-screen.png`. |
| F-1-6 | `/receipt` without an in-memory inspection now has a titled empty state with real start actions. | Route metadata browser check; live `https://export-receipt.sociobot.in/receipt`. |
| F-1-7 | Every SPA route updates title, description, canonical, Open Graph URL/title/description, and Twitter title/description; 404 has static equivalents. | Route metadata browser check; live `/`, `/demo`, `/privacy`, `/terms`, `/receipt`, and `/does-not-exist`. |
| F-1-8 | README names Harbor Mail, Google Takeout, and Meta Download. Added a registered fixture claim for positive, missing, ambiguous, and non-match cases. | `@claim:recognized-layouts`; `tests/inspect.test.ts` ambiguity regression. |
| F-1-9 | Added local JSON receipt import/verification, valid and tampered result states, and a plain signer-identity explanation. | `@claim:receipt-verification`; live demo receipt panel. |
| F-1-10 | Replaced visitor-facing input references with **export** and updated the terminology audit. | `.factory/copy-audit.md`; live landing and README. |
| F-1-11 | Theme controls visibly say “Use dark colors” or “Use light colors.” | `@claim:preference-storage`; live header. |
| F-1-12 | Split the README audience sentence. | `.factory/copy-audit.md`; README. |
| F-1-13 | Split the README feature sentence and registered the named-layout behavior. | `@claim:recognized-layouts`; README. |
| F-1-14 | Rewrote the README safety limits as short sentences. | `@claim:safe-archive-limits`; README. |
| F-1-15 | Split the README test-coverage sentence and removed internal-jargon density. | `npm test`; README. |

Earlier verification findings were rechecked through the full Vitest and browser suite: large JSON, multiline CSV, valid date handling, readable counts, hostile ZIP limits, signatures, browser claim sandboxes, keyboard start, targets, contrast, and PWA offline behavior all pass. No earlier review or polish document existed beyond the reviewed verification history.
