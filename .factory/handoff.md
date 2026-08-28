# Review 4 handoff — Export Receipt

## Result

Review 4 is complete and recorded in `.factory/review-4.md`. Verdict: **FAIL**. No product code was changed.

The report records five findings:

- **Blocking:** `F-4-1` receipt verification accepts an edited receipt after its bundled key is replaced and the payload is signed with that replacement key.
- **Blocking:** `F-4-2` the demo labels a partial in-memory digest as the SHA-256 of a 25,184-byte ZIP that is not shipped.
- **Major:** `F-4-3` the first-screen facts omit price and do not state privacy directly.
- **Minor:** `F-4-4` the shared skip link says “inspection” on non-inspection pages.
- **Minor:** `F-4-5` the ZIP-limit error says “fewer than 1,000 files” while the product accepts 1,000 entries.

All earlier findings were rechecked against the live site and current source. They remain fixed except `F-1-9`, reopened as `F-4-1` because the current verifier has no independent trust reference.

## Verification performed

From fresh clone `/tmp/export-receipt-review4.EQtzCD/repo` at `46b363a8303353504e16a4b12518fa1e26c3f7ad`:

```sh
npm ci
npm test -- --grep @claim:sample-inventory
npm test -- --grep @claim:local-only
npm test -- --grep @claim:json-receipt
npm test -- --grep @claim:html-receipt
npm test -- --grep @claim:supported-formats
npm test -- --grep @claim:source-hash
npm test -- --grep @claim:parse-errors
npm test -- --grep @claim:offline-reload
npm test -- --grep @claim:account-free
npm test -- --grep @claim:preference-storage
npm test -- --grep @claim:demo-isolation
npm test -- --grep @claim:safe-archive-limits
npm test -- --grep @claim:recognized-layouts
npm test -- --grep @claim:receipt-verification
npm test
npm run lint
npm run build
npm audit
npm audit --omit=dev
npm run verify:live -- https://export-receipt.sociobot.in artifacts/review4-live
```

All commands exited successfully. The independent checks in the review show that the `source-hash`, `html-receipt`, and `receipt-verification` tests under-assert their claims.

Fresh 390 × 844 and 1440 × 900 live loads made the job, audience, and sample action clear. The demo loaded in one click, showed realistic sample results, preserved real storage during Reset/exit, and made same-origin GET requests only. The live route/accessibility/PWA verifier also passed with no unexpected console errors.

## Next steps

Resolve every finding in `.factory/review-4.md`, strengthen the affected claim tests, then repeat the clean-clone and live review. Existing unrelated `graphify-out/` changes were preserved and are not part of this handoff.
