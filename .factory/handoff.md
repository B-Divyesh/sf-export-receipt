# Export Receipt review 3 handoff

## Result

Completed a full adversarial first-read review of repository commit `5bd4884473ca8dec431b91c11e26a877aad30b77` and the matching live deployment at <https://export-receipt.sociobot.in>.

Verdict: **FAIL**. The detailed report is `.factory/review-3.md`. It records two blocking findings and five minor findings. No product code was changed.

## Verification performed

- Fresh 390 × 844 and 1440 × 900 cold reads with screenshots in `/tmp/export-receipt-review-3/`.
- Live one-click demo, Reset, Start for real, seeded real-storage isolation, request logging, direct `?demo=1`, and one-visit offline reload.
- Live route metadata, direct HTTP statuses, link crawl, focus/history checks, 404, and light/dark axe checks across all routes.
- `/opt/fleet/lib/verify-url.sh https://export-receipt.sociobot.in /tmp/export-receipt-review-3/verify` passed after creating the evidence directory.
- Clean clone `/tmp/export-receipt-review3-clean/repo`: `npm ci`, all 14 exact claim commands separately, full `npm test`, `npm run lint`, and `npm run build` passed.
- Live app JavaScript, CSS, and hero-image SHA-256 hashes match the clean build.

## Findings to repair

1. F-3-1: entering demo traps browser Back and the wordmark on `/demo`.
2. F-1-9 reopened: the landing promises HTML-or-JSON verification, but only JSON is verifiable and the HTML claim test checks text only.
3. F-3-2: `/receipt` is absent from `sitemap.xml`.
4. F-3-3: **THE RECEIPT DESK** is decorative metaphor copy.
5. F-3-4: the Terms h1 does not name the page.
6. F-3-5: the Privacy contact instruction provides no destination.
7. F-3-6: the landing caption exposes an internal asset-production note.

Pre-existing changes in `graphify-out/` were left untouched.
