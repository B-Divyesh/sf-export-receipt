# Polish round 4 — cumulative zero-finding closure

Released candidate: `46b363a8303353504e16a4b12518fa1e26c3f7ad`. Review commit: `4487bedcffc47b6aacbca27c611bda282b114e14`. Product repair commit: `87289df03b1c0ff0706694e702ec12ca2b9e2013`.

Every finding in `.factory/review-1.md` through `.factory/review-4.md` and every earlier polish record was rechecked. Earlier closure notes were treated as leads, not proof.

| Finding ID | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept navigation fallback on the precached app shell. The bundled sample and worker remain available after one visit. | `@claim:offline-reload`; local `artifacts/local-polish-4/polish-4-demo-mobile.png`; live `/demo` offline reload. |
| F-1-2 | Kept demo color changes in memory. Reset, Start for real, Back, and Home preserve seeded real storage. | `@claim:demo-isolation`; local `artifacts/local-polish-4/polish-4-demo-back-mobile.png`; live `/?demo=1`. |
| F-1-3 | Kept the CSP-safe receipt-styled 404 with shared navigation, metadata, focus styling, and 44 px controls. | Production browser 404/axe test; local `artifacts/local-polish-4/polish-4-404-mobile.png`; live `/does-not-exist-polish-4` returns 404. |
| F-1-4 | Kept `?demo=1` normalizing to `/demo` with the same isolated sample, persistent banner, Reset, and Start for real. | `@claim:demo-isolation`; live `/?demo=1`. |
| F-1-5 | Kept copy before art on phones. The complete action, outcome, privacy, offline, and price facts end at 599 px on 390 × 844. | Production browser first-screen assertion; `artifacts/mobile-first-screen.png`; local `artifacts/local-polish-4/polish-4-root-mobile.png`. |
| F-1-6 | Kept `/receipt` as a real empty route with its own h1, title, metadata, and start actions. | Route metadata/axe test; local `artifacts/local-polish-4/polish-4-receipt-empty-mobile.png`; live `/receipt`. |
| F-1-7 | Kept route-specific title, description, canonical, Open Graph, and Twitter metadata on all SPA routes and the 404. | Production browser route sweep; live `/`, `/demo`, `/privacy`, `/terms`, `/receipt`, and unknown-route checks. |
| F-1-8 | Kept Harbor Mail, Google Takeout, and Meta Download inspectors with positive, missing, ambiguous, and non-match fixtures. | `@claim:recognized-layouts`; Vitest inspector regressions; live Harbor Mail `/demo`. |
| F-1-9 | Kept HTML explicitly readable and unsigned. Narrowed JSON checking to its bundled signature and disclosed that it cannot identify a signer or detect editing followed by re-signing. | `@claim:html-receipt`; `@claim:receipt-verification`; replacement-key fixture; local `artifacts/local-polish-4/polish-4-receipt-actions-mobile.png`. |
| F-1-10 | Kept **export** as the visitor-facing input term and **file** only for contained files or format instructions. | `.factory/copy-audit.md`; production plain-words audit; live `/`. |
| F-1-11 | Kept visible result-naming controls: **Use dark colors** and **Use light colors**. | `@claim:preference-storage`; light/dark axe tests. |
| F-1-12 | Kept the README audience copy split into short concrete sentences. | `.factory/copy-audit.md`; README sentence audit. |
| F-1-13 | Kept short feature copy and named supported-layout coverage. | `@claim:recognized-layouts`; `.factory/copy-audit.md`. |
| F-1-14 | Kept archive limits in short sentences with exact numeric boundaries. | `@claim:safe-archive-limits`; README audit. |
| F-1-15 | Kept test documentation short and plain. | Full `npm test`; `.factory/copy-audit.md`. |
| F-2-1 | Kept visible 44 px Demo and Privacy header links at 390 px. | Mobile navigation target test; `artifacts/mobile-first-screen.png`. |
| F-3-1 | Kept demo state derived from the destination so browser Back and wordmark Home discard the sample and focus the landing h1. | `@claim:demo-isolation`; `artifacts/local-polish-4/polish-4-demo-back-mobile.png`. |
| F-3-2 | Kept `/receipt` in the sitemap and compare the sitemap set with every declared SPA route. | Production browser sitemap parity test; live `/sitemap.xml`. |
| F-3-3 | Kept the task label **CHECK YOUR EXPORT** instead of metaphor copy. | Production plain-words audit; live `/`. |
| F-3-4 | Kept the legal heading **Terms for using Export Receipt**. | Route heading test; `artifacts/local-polish-4/polish-4-terms-mobile.png`. |
| F-3-5 | Kept a working, named repository issues link with new-tab disclosure. | Legal-link browser test; local `artifacts/local-polish-4/polish-4-privacy-mobile.png`. |
| F-3-6 | Kept the useful caption **Inspect the export, then keep the receipt.** | Production plain-words audit; live `/`. |
| F-4-1 | Removed all claims that the checker proves browser identity or unchanged history. The result says only that the bundled signature matches, with a prominent re-signing limitation. | `@claim:receipt-verification` edits, replacement-key re-signs, and asserts no “unchanged” or “this browser” result; local receipt screenshot; live `/demo`. |
| F-4-2 | Replaced the synthetic partial digest with one exact bundled 869-byte ZIP. Demo inspection now calls `inspectFile()` on those bytes. Full SHA-256 `312216e21b560a39c5bfac1b493917144b901fd25d1504777f0eaa462bc8b6c5` appears in the receipt. | `@claim:source-hash` and `@claim:html-receipt` independently hash all shipped bytes and compare UI, JSON, and HTML; live `/demo`. |
| F-4-3 | Replaced indirect facts with **Your export stays on this device**, **Works offline after first visit**, and **Free to use · no account needed**. | `@claim:local-only`, `@claim:offline-reload`, `@claim:account-free`; 390 × 844 first-screen assertion and screenshot. |
| F-4-4 | Standardized every SPA, 404, and offline skip link to **Skip to main content** targeting `#main`. | Route and 404 skip-link sweep; keyboard first-Tab test; local focus screenshot. |
| F-4-5 | Corrected the error to **at most 1,000 entries** and **at most 50 MB of expanded data**. Added passing exact-boundary fixtures before over-limit cases. | `@claim:safe-archive-limits`; Vitest `accepts the documented ZIP entry and expanded-size boundaries`. |

Additional polish discovered during repair: singular inventory and check counts now use **file** and **check**. The current build keeps the neo-brutalist archive-workbench identity and the `pwa-offline` artifact class.

## Verification evidence

- Fresh clone: every command in `.factory/claims.json` passed independently.
- Fresh clone: `npm test`, `npm run lint`, `npm run build`, `npm audit`, and `npm audit --omit=dev` passed.
- Local dedicated browser suite: `artifacts/local-polish-4/polish-4-verify.json`.
- Local factory URL check: `artifacts/local-polish-4/verify-url/verify.json`.
- Local Lighthouse: `artifacts/local-polish-4/lighthouse.json` — performance 99, accessibility 100, best practices 100, SEO 100.
- Live dedicated browser suite and screenshots: `artifacts/live/polish-4/`.
- Live URL: <https://export-receipt.sociobot.in>.
