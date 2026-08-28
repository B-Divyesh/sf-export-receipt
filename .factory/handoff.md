# Export Receipt polish round 3 handoff

## Result

All 22 cumulative findings in `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md` are closed. The product-specific archive-workbench design and `pwa-offline` deployment class are unchanged. The finding-by-finding record is `.factory/polish-3.md`.

The repaired product is live at <https://export-receipt.sociobot.in>. Product repair commit: `92b5a5fb6c59518518065ad1bf26db00a4fe432a`. Static deployment ID: `85ec1df9-cb2a-4d00-8bb4-d4b2c78b9b73`.

## What changed

- Demo entry works in one click and through `?demo=1`. The persistent banner, Reset, Start for real, browser Back, and wordmark Home all preserve real storage and discard demo state correctly.
- The first screen uses direct job wording and fits the full action, outcome, and three facts inside 390 × 844.
- HTML is described and tested as a readable receipt. Signed JSON is described and tested as the locally verifiable receipt.
- `/`, `/demo`, `/receipt`, `/privacy`, `/terms`, and the designed HTTP 404 have correct titles, metadata, landmarks, focus behavior, mobile layouts, and working navigation.
- `/receipt` is in the sitemap. The Terms heading, Privacy contact, section label, and illustration caption now say exactly what they mean.
- `.factory/claims.json` contains 14 claims, each with exactly one observable `@claim:<id>` browser test.
- `.factory/catalog-description.txt` is a 116-character, verb-first sentence.

## Verification

Clean-clone verification used a fresh checkout with `npm ci`. Every registered claim command was run separately:

`sample-inventory`, `local-only`, `json-receipt`, `html-receipt`, `supported-formats`, `source-hash`, `parse-errors`, `offline-reload`, `account-free`, `preference-storage`, `demo-isolation`, `safe-archive-limits`, `recognized-layouts`, and `receipt-verification` — all passed.

The same clean checkout passed:

```text
npm test
npm run lint
npm run build
npm audit
npm audit --omit=dev
```

`npm test` ran 8 Vitest tests and the complete production-browser suite. `npm run build` produced `dist/index.html`. Both audit commands reported zero vulnerabilities.

Additional evidence:

- Local axe: 0 violations — `artifacts/axe-local.json`.
- Local Lighthouse `/demo`: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.5 s, CLS 0, TBT 140 ms — `artifacts/lighthouse-local.json`.
- Factory live verifier: passed in 932 ms with correct title, `lang=en`, one h1, main landmark, complete alt text, and no errors — `artifacts/live/polish-3/verify.json`.
- Dedicated cold live suite: passed with zero unexpected console errors — `artifacts/live/polish-3-verify.json`.
- Live axe: 0 violations — `artifacts/live/axe-polish-3.json`.
- Live Lighthouse `/demo`: 100 performance, accessibility, best practices, and SEO; FCP 0.8 s, LCP 1.1 s, CLS 0, TBT 30 ms — `artifacts/live/lighthouse-polish-3.json`.
- Live route checks covered direct URLs, exact metadata, focus, 390 px overflow, legal links, sitemap parity, real HTTP 404, CSP/security headers, reduced motion, and one-visit offline reload.
- Local and live SHA-256 values matched: `index.html` `18378a72…`, `sw.js` `2f73fc33…`, app JS `39c9271e…`, CSS `98cd4cad…`, and hero WebP `44653534…`.

Run locally with `npm ci && npm run dev`. Recheck with `npm test && npm run lint && npm run build`. Recheck production with `npm run verify:live -- https://export-receipt.sociobot.in artifacts/live`.

## Known gaps and next steps

None. No finding, TODO, stub, or deferred severity remains. Existing unrelated `graphify-out/` modifications were not changed or committed.
