# Polish round 3 — cumulative zero-finding closure

Released candidate: `5bd4884473ca8dec431b91c11e26a877aad30b77`. Review commit: `7cb201ce6a697b94f07d57f176a0a3c42ddd1d5e`. Product repair commit: `92b5a5fb6c59518518065ad1bf26db00a4fe432a`.

Every finding in `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md` was rechecked. Earlier polish records were treated as evidence, not as proof that a finding remained fixed.

| Finding ID | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept navigation on the precached app shell, cleaned obsolete worker caches, and retained the sample entirely in memory. The test now goes offline after one `/demo` visit without an extra online reload. | `@claim:offline-reload`; `npm run verify:live` check **offline after one visit**; live [`/demo`](https://export-receipt.sociobot.in/demo). |
| F-1-2 | Demo color changes remain memory-only. Reset, Start for real, Back, and wordmark Home leave seeded real storage byte-for-byte unchanged and discard the sample. | `@claim:demo-isolation`; live check **query demo and isolation**; [`polish-3-demo-mobile.png`](../artifacts/live/polish-3-demo-mobile.png). |
| F-1-3 | Kept the CSP-safe, receipt-styled static 404 with shared navigation, route metadata, focus styles, and 44 px targets. | Production-browser **404 metadata/accessibility** check; live HTTP 404 at [`/does-not-exist-polish-3`](https://export-receipt.sociobot.in/does-not-exist-polish-3); [`polish-3-404-mobile.png`](../artifacts/live/polish-3-404-mobile.png). |
| F-1-4 | `?demo=1` normalizes to `/demo`, immediately loads the sample, and shows the persistent demo banner with Reset and Start for real. | `@claim:demo-isolation`; live [`/?demo=1`](https://export-receipt.sociobot.in/?demo=1); live check **query demo and isolation**. |
| F-1-5 | Kept the phone copy-before-art layout. At 390 × 844, the action, its result, and all three facts end at 599 px. | Production-browser **mobile first screen** check; live check **cold first screen**; [`polish-3-root-mobile.png`](../artifacts/live/polish-3-root-mobile.png). |
| F-1-6 | Kept the direct `/receipt` empty state with its own title, description, canonical, one h1, and working sample and real-start actions. | Production-browser **route structure and metadata** check; live [`/receipt`](https://export-receipt.sociobot.in/receipt); [`polish-3-receipt-empty-mobile.png`](../artifacts/live/polish-3-receipt-empty-mobile.png). |
| F-1-7 | All five SPA routes and the static 404 have exact route-specific titles, descriptions, canonicals, Open Graph, and Twitter metadata. | Production-browser **route structure and metadata** check; live check **routes, metadata, legal, mobile, axe**; factory URL verifier in [`artifacts/live/polish-3/verify.json`](../artifacts/live/polish-3/verify.json). |
| F-1-8 | Kept real Harbor Mail, Google Takeout, and Meta Download recognition, including positive, missing-category, ambiguous, and non-match outcomes. | `@claim:recognized-layouts`; Vitest inspection fixtures; live Harbor Mail sample at [`/demo`](https://export-receipt.sociobot.in/demo). |
| F-1-9 | Removed the false HTML-verification promise. HTML is now explicitly a readable, unsigned receipt; signed JSON is the locally verifiable format. The HTML test downloads and checks the actual file while valid and tampered JSON imports prove verification. | `@claim:html-receipt`; `@claim:receipt-verification`; live check **receipt outputs**; [`polish-3-receipt-actions-mobile.png`](../artifacts/live/polish-3-receipt-actions-mobile.png). |
| F-1-10 | Kept **export** as the single visitor-facing term for the selected input. | Production-browser **plain-words audit**; `.factory/copy-audit.md`; live landing and demo. |
| F-1-11 | Kept result-naming controls: **Use dark colors** and **Use light colors**. Demo use does not persist the choice. | `@claim:preference-storage`; `@claim:demo-isolation`; live landing and demo. |
| F-1-12 | Kept the README audience copy split into short, direct sentences. | Production-browser **plain-words audit**; `.factory/copy-audit.md`; README. |
| F-1-13 | Kept the README feature copy short and tied named-layout behavior to a claim and fixtures. | `@claim:recognized-layouts`; `.factory/copy-audit.md`; README. |
| F-1-14 | Kept source, entry, expansion, ratio, and text limits in separate plain sentences and tested each limit. | `@claim:safe-archive-limits`; `.factory/copy-audit.md`; README. |
| F-1-15 | Updated the README coverage sentence to include demo Back/Home, route metadata, sitemap, 404, and color-mode checks without overstating the suite. | Full `npm test`; production-browser regression suite; `.factory/copy-audit.md`. |
| F-2-1 | Kept visible **Demo** and **Privacy** navigation on 390 px screens; each target measures at least 44 px and opens its real route. | Production-browser **mobile header navigation** check; live cold landing target measurements; [`polish-3-root-mobile.png`](../artifacts/live/polish-3-root-mobile.png). |
| F-3-1 | Demo state now follows the navigation destination. Browser Back and wordmark Home leave `/demo`, remove the banner/sample, restore the real theme, and focus the landing h1. Async demo loading is guarded against stale renders. | `@claim:demo-isolation`; live check **demo Back and Home**; [`polish-3-demo-back-mobile.png`](../artifacts/live/polish-3-demo-back-mobile.png) and [`polish-3-focus-mobile.png`](../artifacts/live/polish-3-focus-mobile.png). |
| F-3-2 | Added `/receipt` to `sitemap.xml`, published the sitemap in `robots.txt`, and compare the sitemap set with every declared SPA route. | Production-browser **sitemap parity** check; live check **sitemap, 404, headers**; live [`/sitemap.xml`](https://export-receipt.sociobot.in/sitemap.xml). |
| F-3-3 | Replaced **THE RECEIPT DESK** with the task label **CHECK YOUR EXPORT**. | Production-browser **plain-words audit**; live [`/`](https://export-receipt.sociobot.in/); [`polish-3-root-mobile.png`](../artifacts/live/polish-3-root-mobile.png). |
| F-3-4 | Replaced the mood-line Terms h1 with **Terms for using Export Receipt**. | Production-browser **legal pages** check; live [`/terms`](https://export-receipt.sociobot.in/terms); [`polish-3-terms-mobile.png`](../artifacts/live/polish-3-terms-mobile.png). |
| F-3-5 | Replaced the unavailable contact direction with a named, working repository issues link that discloses a new tab. | Production-browser **legal pages** check; live [`/privacy`](https://export-receipt.sociobot.in/privacy); destination returned 200; [`polish-3-privacy-mobile.png`](../artifacts/live/polish-3-privacy-mobile.png). |
| F-3-6 | Removed the internal generation note from the caption. It now says **Inspect the export, then keep the receipt.** Asset provenance remains in `.factory/design.md`. | Production-browser **plain-words audit**; live landing; [`polish-3-root-mobile.png`](../artifacts/live/polish-3-root-mobile.png). |

## Final evidence

- Every one of the 14 commands in `.factory/claims.json` passed separately in a fresh clone. The full clean-clone test, lint, build, and audit suite also passed.
- Local axe: zero violations. Live axe: zero violations. The live route sweep also found zero serious or critical issues on every SPA route and the 404 at 390 px.
- Local Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO. Live Lighthouse: 100 in all four categories.
- The factory verifier passed with no errors. The dedicated live verifier passed with no unexpected console errors and rechecked demo isolation, receipts, routing, metadata, mobile overflow, accessibility, offline reload, reduced motion, 404, sitemap, and security headers.
- The deployed app JS is 24,009 bytes raw and 9.23 kB gzip. CSS is 11,820 bytes raw and 3.48 kB gzip. The hero WebP is 39,340 bytes.

No review finding remains open.
