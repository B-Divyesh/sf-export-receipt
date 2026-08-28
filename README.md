# Export Receipt

Check a data export before access ends. It is for people leaving a service or making a backup who need a local record of files, dates, categories, unreadable data, and next checks.

The app reads ZIP, JSON, CSV, and text exports in the browser. It hashes the selected source, parses readable data, flags unsafe paths and missing categories for recognized layouts, and downloads signed HTML or JSON receipts. Archives are not uploaded. ZIP inspection has explicit source, entry, expansion, and text-size limits before work begins.

## Run

Requires Node 20 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/demo` for the isolated sample. It reconstructs sample data in memory and stores nothing.

## Verify and build

```sh
npm test
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

`npm test` runs parser regressions plus Chromium checks against the production build. The browser suite covers the demo, local-only upload flow, signed downloads, offline reload, 390px targets/keyboard, and axe in light and dark modes. The static deploy output is `dist/`, with `index.html` at its root; deploy that directory with the included `staticwebapp.config.json`.

## Privacy

Export Receipt has no account, analytics, server API, or archive upload. Color mode is the only browser preference it stores. See `/privacy` and `/terms` in the app. It is released under the [MIT License](LICENSE).

## Catalog description

Check a data export before access ends with a local receipt of files, dates, categories, and warnings.
