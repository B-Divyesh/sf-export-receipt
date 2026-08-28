# Export Receipt review 5 handoff

## Result

The independent adversarial review is recorded in `.factory/review-5.md`.
Verdict: **FAIL**. No product code was modified.

## What was checked

- Fresh live browser contexts at 390 × 844 and 1440 × 900 established the
  first-screen job, audience, and first action.
- The full landing and README copy audit is in the review, including word
  counts and plain-words/button checks.
- `/demo` and `/?demo=1` were exercised. The realistic sample, persistent
  demo banner, reset/exit behavior, storage isolation, and request logs were
  checked.
- A clean clone at `55ef65b731b28b5a2f0951a46a73a92b5bb560ca` used `npm ci`.
  `npm test`, each of the 14 registered claim commands, `npm run lint`, and
  `npm run build` passed. The build generated `dist/`.
- The live verifier passed route metadata, axe, cold 404, links, privacy,
  offline reload, reduced motion, and console checks.
- Every earlier review finding was checked again in live behavior and code.

## Known gap / next step

**Blocking F-5-1 (reopens F-1-3):** after the service worker controls a
browser session, navigating to an unknown URL returns the cached app shell
with HTTP 200 instead of the designed HTTP 404. Update `public/sw.js` so only
declared application routes use the cached shell; unknown navigations must go
to the network/static 404. Add a controlled-service-worker 404 status test.

Run locally with `npm ci && npm test && npm run lint && npm run build`. Recheck
the live deployment with `npm run verify:live -- https://export-receipt.sociobot.in artifacts/live` plus the new controlled-PWA 404 test.
