# Polish round 5 — cumulative zero-finding closure

Released candidate: `55ef65b731b28b5a2f0951a46a73a92b5bb560ca`. Review commit: `9177c6b67241f5f5f96b84f2bbf92ecb548f7323`. Product repair commit: `58e5f62c1808939bebfad1148f17edb23c741f36`.

Every finding in `.factory/review-1.md` through `.factory/review-5.md` and every earlier polish record was checked against the current source, a clean clone, and the deployed site. Earlier closure notes were treated as leads, not proof.

| Finding ID | Change made or retained | Evidence |
|---|---|---|
| F-1-1 | Declared app routes use the precached shell, so one visit is enough for an offline demo reload. | `@claim:offline-reload`; live [`/demo`](https://export-receipt.sociobot.in/demo); `artifacts/live/polish-5/polish-5-verify.json`. |
| F-1-2 | Demo color changes and sample state remain memory-only; Reset, Start for real, Back, and Home preserve real storage. | `@claim:demo-isolation`; [`polish-5-demo-mobile.png`](../artifacts/live/polish-5/polish-5-demo-mobile.png); live [`/?demo=1`](https://export-receipt.sociobot.in/?demo=1). |
| F-1-3 | The CSP-safe designed 404 remains intact. Round five also prevents the worker from replacing unknown routes with a 200 app shell. | Production-browser cold and controlled 404 assertions; [`polish-5-controlled-404-mobile.png`](../artifacts/live/polish-5/polish-5-controlled-404-mobile.png); live unknown route returned 404. |
| F-1-4 | `?demo=1` normalizes to `/demo`, immediately loads the shipped sample, and shows Reset and Start for real. | `@claim:demo-isolation`; live [`/?demo=1`](https://export-receipt.sociobot.in/?demo=1); demo screenshot above. |
| F-1-5 | The phone layout keeps the headline, audience, action, outcome, and all three facts above the fold. | Production-browser **mobile first screen** assertion; 599 px bottom at 390 × 844; [`polish-5-root-mobile.png`](../artifacts/live/polish-5/polish-5-root-mobile.png). |
| F-1-6 | `/receipt` remains a real empty route with its own title, metadata, h1, and working start actions. | Production-browser **route structure and metadata** assertion; [`polish-5-receipt-empty-mobile.png`](../artifacts/live/polish-5/polish-5-receipt-empty-mobile.png); live [`/receipt`](https://export-receipt.sociobot.in/receipt). |
| F-1-7 | Every declared route and the static 404 retain distinct titles, descriptions, canonicals, Open Graph, and Twitter metadata. | Production-browser route sweep; `artifacts/live/polish-5/polish-5-verify.json`; live `/`, `/demo`, `/privacy`, `/terms`, `/receipt`, and unknown URL. |
| F-1-8 | Harbor Mail, Google Takeout, and Meta Download recognition remains covered for positive, missing, ambiguous, and non-match inputs. | `@claim:recognized-layouts`; live Harbor Mail sample at [`/demo`](https://export-receipt.sociobot.in/demo). |
| F-1-9 | HTML remains explicitly unsigned. JSON checking says only that the bundled signature matches and discloses its signer and re-signing limits. | `@claim:html-receipt`; `@claim:receipt-verification`; [`polish-5-receipt-actions-mobile.png`](../artifacts/live/polish-5/polish-5-receipt-actions-mobile.png); live `/demo`. |
| F-1-10 | Visitor-facing input copy consistently uses **export**; **file** is reserved for contained files and format instructions. | `.factory/copy-audit.md`; production plain-words audit; live [`/`](https://export-receipt.sociobot.in/). |
| F-1-11 | Color controls keep the result-naming labels **Use dark colors** and **Use light colors**. | `@claim:preference-storage`; light/dark axe checks; live root screenshot. |
| F-1-12 | The README audience description remains split into short, concrete sentences. | `.factory/copy-audit.md`; clean-clone production plain-words assertion. |
| F-1-13 | README feature copy remains short and the named layout behavior remains claim-backed. | `@claim:recognized-layouts`; `.factory/copy-audit.md`. |
| F-1-14 | Source, entry, expansion, ratio, and text limits remain in short exact sentences. | `@claim:safe-archive-limits`; `.factory/copy-audit.md`. |
| F-1-15 | README verification copy remains short and accurately names the browser, route, offline, and keyboard coverage. | Full clean-clone `npm test`; `.factory/copy-audit.md`. |
| F-2-1 | The 390 px header retains visible 44 px Demo and Privacy links. | Production-browser **mobile header navigation** assertion; live root screenshot and live `/demo` and `/privacy` navigation. |
| F-3-1 | Browser Back and the wordmark leave demo mode, remove the sample/banner, restore the real color preference, and focus the landing h1. | `@claim:demo-isolation`; [`polish-5-demo-back-mobile.png`](../artifacts/live/polish-5/polish-5-demo-back-mobile.png); live demo Back/Home check. |
| F-3-2 | `/receipt` remains in `sitemap.xml`; the sitemap set equals the declared SPA route set. | Production-browser **sitemap parity** assertion; live [`/sitemap.xml`](https://export-receipt.sociobot.in/sitemap.xml). |
| F-3-3 | The landing section retains the task label **CHECK YOUR EXPORT**. | Production plain-words audit; live root screenshot. |
| F-3-4 | The Terms h1 remains **Terms for using Export Receipt**. | Production-browser legal-page assertion; [`polish-5-terms-mobile.png`](../artifacts/live/polish-5/polish-5-terms-mobile.png); live [`/terms`](https://export-receipt.sociobot.in/terms). |
| F-3-5 | Privacy retains the named repository issues link, new-tab disclosure, and valid destination. | Production-browser legal-link assertion; [`polish-5-privacy-mobile.png`](../artifacts/live/polish-5/polish-5-privacy-mobile.png); live [`/privacy`](https://export-receipt.sociobot.in/privacy). |
| F-3-6 | The useful caption remains **Inspect the export, then keep the receipt.** Asset provenance stays in `.factory/design.md`. | Production plain-words audit; live root screenshot. |
| F-4-1 | The checker makes no browser-identity or unchanged-history claim. An edited receipt re-signed with a replacement key is described only as matching its bundled signature. | `@claim:receipt-verification`; replacement-key fixture; receipt screenshot; live `/demo`. |
| F-4-2 | The demo still inspects the exact shipped 869-byte ZIP through `inspectFile()` and shows its full SHA-256 in UI, JSON, and HTML. | `@claim:source-hash`; `@claim:html-receipt`; digest `312216e21b560a39c5bfac1b493917144b901fd25d1504777f0eaa462bc8b6c5`; live demo screenshot. |
| F-4-3 | The first screen retains explicit privacy, offline, and price facts. | `@claim:local-only`; `@claim:offline-reload`; `@claim:account-free`; live root screenshot. |
| F-4-4 | Every SPA and status route uses **Skip to main content** with `href="#main"`. | Production-browser route/404 skip-link sweep; [`polish-5-focus-mobile.png`](../artifacts/live/polish-5/polish-5-focus-mobile.png). |
| F-4-5 | ZIP errors and docs use **at most 1,000 entries** and **at most 50 MB**; exact boundaries pass before over-limit cases fail. | `@claim:safe-archive-limits`; clean-clone browser boundary fixtures. |
| F-5-1 | The service worker now serves its cached shell only for `/`, `/demo`, `/privacy`, `/terms`, and `/receipt`. Unknown online navigations reach Static Web Apps and retain HTTP 404. | `npm test` controlled-PWA 404 regression; live **controlled-PWA 404** check in `artifacts/live/polish-5/polish-5-verify.json`; controlled screenshot; `https://export-receipt.sociobot.in/does-not-exist-polish-5-controlled` returned 404. |

## Final evidence

- A clean clone of `58e5f62c1808939bebfad1148f17edb23c741f36` passed all 14 commands from `.factory/claims.json` separately.
- The same clean clone passed `npm test`, `npm run lint`, `npm run build`, `npm audit`, and `npm audit --omit=dev`. Nine Vitest regressions and the full production-browser suite passed.
- Local route/axe/privacy/offline verification passed with zero unexpected console errors: `artifacts/local-polish-5/polish-5-verify.json`.
- Live cold and controlled route verification passed with zero unexpected console errors: `artifacts/live/polish-5/polish-5-verify.json`.
- Local and live Lighthouse scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO. Live LCP was 1.2 s, CLS 0, and TBT 20 ms.
- The factory URL verifier passed locally and live with a title, `lang=en`, one h1, a main landmark, image alt text, and no console errors.
- The deployed app JavaScript is 25.02 kB raw / 10.06 kB gzip. CSS is 12.30 kB raw / 3.58 kB gzip. The hero WebP is 39.34 kB.
- The existing Static Web App production environment reported Ready at `2026-08-28T22:58:22.015388+00:00`. Live `index.html` and `sw.js` byte-match the tested build.

No finding, stub, or deferred severity remains.
