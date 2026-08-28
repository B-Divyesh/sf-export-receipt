# Export Receipt visual system

## Direction
**Neo-brutalist utility.** An exported archive is treated like evidence on a workbench: a sturdy paper receipt, high-contrast audit marks, chunky ink rules, and folder-tab geometry. The style makes inspection feel concrete rather than opaque.

## Tokens
- Ink `#18211d` (primary text/outline), paper `#fff8e8` (warm app ground), panel `#fffdf6`
- Lime `#c9ff4d` (primary action), orange `#ff7043` (warning), blue `#4f8cff` (information)
- Success `#176b43`, danger `#b12b28`, muted `#53605a`
- Night mode: ink `#f5f0e5`, paper `#17201b`, panel `#233128`; retain lime as the action color.

## Type and spacing
System-only type makes the app immediately available offline: `Arial Black`/Impact-style display for labels, with `system-ui` for reading and data. The 8px scale governs all space. Tables use tabular figures. Square corners, 3px ink borders and offset hard shadows form the component grammar.

## Motion
Only short 180ms transform/opacity movement: inspection cards lift from the archive tray after an import. With reduced motion, states change immediately with no transform. Nothing loops.

## Art direction and provenance
Original hero art is a generated editorial still life: archival ZIP folder, receipt strip, magnifier and data cards on warm paper; flat inked neo-brutalist print textures; lime/orange/blue accents; no people, no text, no watermark, no logos. Generated 2026-08-28 with the factory image deployment via `/opt/fleet/lib/gen-image.sh`; original product asset. It is reviewed and compressed to WebP for use in the hero and social image.
