# Export Receipt verification handoff

## Result: FAIL

Candidate `888d44e08193169f2aa7156607d6e8c179181e13` was independently tested at <https://export-receipt.sociobot.in> on 2026-08-28 UTC. The live HTML, JS, CSS, service worker, and manifest hashes match the candidate build.

Do not release this candidate. Release-blocking evidence is in [verification.md](verification.md): valid JSON above 1 MB is falsely called unreadable; multiline CSV counts and invalid dates are wrong; common-export/category inspectors are absent; receipts are unsigned; claim tests do not exercise their declared browser sandboxes and omit multiple product claims; axe reports serious mobile/dark-theme failures; touch targets are undersized; and ZIP decompression has no resource limits.

## Verification summary

- Clean install, full tests (5/5), TypeScript, and production build pass.
- First-read and one-click demo gates pass.
- Live deployment matches the tested commit.
- Offline demo reload, installability, privacy isolation, downloads, invalid-input recovery, keyboard focus, reduced motion, and bundle budgets pass.
- Lighthouse mobile `/demo`: performance 100, accessibility 96, best practices 100; LCP 1.1 s, TBT 50 ms, CLS 0.
- Axe still reports serious failures and therefore overrides the aggregate Lighthouse score.
- No backend/API or sign-in exists; rate-limit and Entra checks are not applicable.

## Reproduce

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open `/demo` at desktop and 390 px. Full commands, fixtures, observed outputs, headers, bundle sizes, and defect severities are recorded in `.factory/verification.md`.

## Next steps

Replace extension heuristics with bounded, pluggable inspectors; correctly parse complete JSON/CSV and validate dates; define expected categories for supported fixtures; implement verifiable receipt signatures; convert claims to browser demo tests and list every public claim; fix all axe/touch failures; move ZIP work off the main thread; then correct 404 and caching behavior and rerun the full verification.
