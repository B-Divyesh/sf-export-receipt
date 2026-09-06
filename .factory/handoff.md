# Export Receipt verification 4 handoff

## Result

**FAIL — 3 findings remain; 0 public claims are untested.**

- Live URL: <https://export-receipt.sociobot.in>
- Implementation SHA: `6f0739ef17c4a1fccb85f715c099a2385b312e08`
- Documentation SHA reviewed: `feffdf5528f034701c0c2a3a287bad83aec9cac9`
- Deployment ID: `7cec1f4b-f8b2-446a-8d90-3586e981300c`
- Full report: `.factory/verification-4.md`

No product code was changed.

## Findings to repair

1. Major: the real export file input is transparent. Its keyboard focus outline is also transparent, while the visible drop-zone label has no focus state.
2. Minor: `rel="apple-touch-icon"` points to a 192 × 192 file instead of the required 180 × 180 icon.
3. Minor: the generated landing illustration is documented internally but not disclosed on the site footer or an About page.

## What passed

- A fresh checkout passed all 14 exact claim commands separately, `npm test`, `npm run lint`, `npm run build`, `npm audit`, and `npm audit --omit=dev`.
- The live runtime byte-matches the clean build for the application shell, hashed assets, worker, manifest, 404, and offline resources.
- Fresh 390 × 844 phone and 1440 × 900 desktop contexts plainly show the job, audience, sample action, result explanation, and three facts before scrolling.
- The one-click Harbor Mail demo, persistent label, reset, exit, Back, Home, exact hash, downloads, signature checks, real-storage isolation, and no-upload request behavior pass.
- Normal, malformed, unsupported, boundary, hostile-path, ambiguous-layout, and recovery paths pass.
- Offline reload after one visit, reduced motion, route titles and metadata, legal pages, link crawl, true cold and controlled 404s, 200% text layout, and the review-7 focus contrast repairs pass.
- Axe reports no automated violations. Lighthouse mobile scores 100 in performance, accessibility, best practices, and SEO. LCP is 1.2 s, TBT 20 ms, and CLS 0.

## Verification evidence

Evidence is under `/work/.evidence/verification-4/`. The required report copy is `/work/.evidence/qa-report.md`; the machine result is `/work/.evidence/qa-result.json`.

## Next steps

Add a visible, contrast-tested focus state to `.drop-zone` when `#archive` is keyboard-focused. Add and reference a 180 px Apple touch icon. Add a plain generated-image disclosure to the shared and static-404 footers. Then rerun all claim commands and the live focus, metadata, icon, and disclosure checks.
