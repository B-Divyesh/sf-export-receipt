# Export Receipt handoff

## What shipped

- A Vite + TypeScript PWA that inspects local ZIP, JSON, CSV, and text exports.
- File inventory, readable-record counts, attachments, date coverage, SHA-256, malformed-file and hostile-path findings.
- Downloadable JSON and standalone HTML receipts with a retest checklist.
- A one-click `/demo` sandbox built from shipped sample bytes, with reset and exit controls.
- Offline shell, web manifest, service worker, icon set, security configuration, legal routes, sitemap, robots, and a styled 404 page.
- Original generated hero art at `assets/src/archive-workbench.png`, optimized as `public/archive-workbench.webp` (39 KB). Prompt metadata is beside the source image and provenance is in `design.md`.

## Verify

Run `npm install`, `npm test`, then `npm run build`. Open `/demo`; it should show four files, two readable tables, an attachment, and coverage from 2022-02-19 to 2025-01-08. Download both receipt formats from the result screen.

## Quality notes

The app has semantic landmarks, title and descriptions, one h1 per route, focus styling, keyboard-operable controls, reduced-motion handling, responsive 390px layout, no third-party runtime calls, and an initial bundled JavaScript target below 200 KB. Lighthouse against `/demo` at mobile defaults scored **91 performance** and **96 accessibility**. The production app bundle is 8.69 KB gzip; CSS is 3.08 KB gzip; the hero WebP is 39 KB.

## Known gaps

Inspectors are intentionally generic. Encrypted ZIPs and proprietary binary formats are reported as unreadable; no vendor-specific format promises are made. The receipt is a technical inventory, not legal-compliance advice.
