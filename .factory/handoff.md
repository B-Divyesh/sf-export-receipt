# Export Receipt review 7 handoff

## Result

**FAIL — 2 findings, 0 untested claims.**

The full report is `.factory/review-7.md`. Product code was not modified.

Implementation candidate `58e5f62c1808939bebfad1148f17edb23c741f36` was reviewed at <https://export-receipt.sociobot.in>. Documentation before this review ended at `3ee4d0686098979d4e8a23248bc91fcd4b2d9de8`; the supplied checkout was `11396b6fbe8233f70ec49bcfb690e5de7f009780`. Live application, worker, CSS, image, service worker, manifest, and 404 hashes match the clean build.

## Findings to repair

1. At 390 px and 200% text size, the wordmark, Demo, and Privacy text overlap on every app route and the 404.
2. The light-theme orange focus outline has 2.59:1 contrast against the page and 2.70:1 against panels. The required minimum is 3:1.

Evidence is in `/work/.evidence/review-7/header-200-percent.png` and `/work/.evidence/review-7/404-header-200-percent.png`.

## Checks completed

- Installed documented prerequisites with `npm ci` in a clean checkout.
- Ran all 14 exact claim commands separately; all passed.
- Ran `npm test`, `npm run lint`, and `npm run build`; all passed and produced `dist/`.
- Ran the product live verifier and factory `verify-url.sh`; both passed their declared checks.
- Checked fresh 390 × 844 and 1440 × 900 first screens, one-click sample, persistent demo label, reset, exit, Back, Home, and real-data isolation.
- Checked normal, unsupported, malformed, exact-boundary, over-limit, hostile-path, ambiguous-layout, and recovery paths.
- Checked keyboard operation, focus movement, arrows, both color modes, axe, reduced motion, 200% text, legal pages, links, titles, metadata, cold and controlled 404s, offline reload, storage, and request privacy.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.1 s, TBT 0 ms, CLS 0.
- Rechecked every finding from all earlier verification and review reports. Their named product defects remain fixed; the two current issues are new manual accessibility findings.

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run build
npm run verify:live -- https://export-receipt.sociobot.in /tmp/export-receipt-live-review
```

Run every `test` command in `.factory/claims.json` separately. For F-7-1, open each route at 390 px and set text size to 200%. For F-7-2, compare the computed `#ff7043` outline with `#fff8e8` and `#fffdf6`.

## Next step

Repair both accessibility findings, add regressions, deploy the new implementation, and repeat live verification. No other gap was found.
