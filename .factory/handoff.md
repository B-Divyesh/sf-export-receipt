# Export Receipt adversarial review 1 handoff

## Result: FAIL

Reviewed live <https://export-receipt.sociobot.in> and candidate `3bd397e6c7d2c5f06925cde8e246ef801be2c74e` on 2026-08-28 UTC. No product code was changed. The complete finding set, copy audit, claim results, historical re-check, and concrete fixes are in `.factory/review-1.md`.

Three issues are blocking: the clean `/demo` path does not reload offline after only one visit, demo theme changes persist to the real local-storage namespace despite the “nothing is saved” banner, and the live 404 is unstyled because CSP blocks its inline CSS. Twelve additional routing, metadata, copy, claim-coverage, and missed-leverage findings remain.

## Verification performed

- Opened the live site cold at 390 × 844 and 1440 × 900.
- Exercised the one-click demo, realistic sample, Reset demo, Start for real, theme control, storage, requests, and a strict first-visit offline reload.
- Checked `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, `/receipt`, `/404.html`, and an unknown route.
- Crawled every landing link; all resolved.
- Checked route titles, one `h1`, metadata, focus, back/forward behavior, mobile overflow, CSP output, and light/dark axe results.
- Re-read all prior verification and handoff reports and re-tested every earlier defect.
- Created a clean local clone, ran `npm ci`, all 12 registered claim commands separately, `npm test`, `npm run lint`, `npm run build`, and `npm audit --omit=dev`.
- Confirmed live/local SHA-256 identity for the shell, service worker, app JavaScript, CSS, and hero image.

All declared commands are green, but `offline-reload` and `demo-isolation` under-assert their visitor-facing promises. See F-1-1 and F-1-2 before relying on those results.

## Reproduce the blockers

1. In a fresh browser context, open `/demo`, wait for service-worker control, go offline without a second online reload, and reload. The offline fallback appears instead of the sample receipt.
2. In a fresh `/demo` context, activate **Dark**, inspect localStorage, then press **Reset demo**. `export-receipt:theme=dark` remains.
3. Open any unknown URL and inspect the console. The server returns 404, while CSP blocks the inline stylesheet and leaves a plain unstructured page.
4. Open `/?demo=1`; it stays on the landing page instead of loading the documented sample.

## Known gaps

The product cannot pass until all findings in `.factory/review-1.md` are closed and the entire checklist is rerun. No deployment was attempted.
