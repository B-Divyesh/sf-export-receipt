# Export Receipt verification handoff

## Result: **FAIL — do not release**

Independent verification of candidate `00be3aad19c832d9a12ce9983310ef704c90a60b` at <https://export-receipt.sociobot.in> completed on 2026-08-28 UTC. The deployment exactly matches the candidate's built HTML, app JS, CSS, service worker, and manifest.

The core product is functioning: all eight declared claim tests, full tests, TypeScript lint, production build, browser/axe checks, signed receipt downloads, local-only flow, hostile-ZIP rejection, and live offline reload passed. The candidate nevertheless **FAILS** the factory release contract because `.factory/claims.json` omits multiple visitor-facing claims (including no account/analytics/storage and demo-isolation guarantees), contrary to the mandatory every-claim-is-a-test rule. Initial keyboard focus also bypasses the header and skip link.

See [verification-2.md](verification-2.md) for exact evidence and defects by severity.

## How to verify

```sh
npm ci
npm test
npm run lint
npm run build
```

Then run every `test` command in `.factory/claims.json` individually. Use `/demo` for the isolated sample. It should show four files, an attachment, date coverage, and a missing Profile category; it must reload offline after the first controlled visit.

## Required next steps

1. Register and browser-test every unlisted visitor claim, or remove it from the product/README/demo copy.
2. Prevent `h1` focus on initial document load so a fresh Tab reaches the skip link/header sequence.
3. Rebuild, deploy, and commission a fresh independent verification.
