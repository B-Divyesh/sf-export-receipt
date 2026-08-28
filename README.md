# Export Receipt

Check a data export before access ends.

It is for people leaving a service or making a backup. It records files, dates, missing categories, unreadable data, and next checks.

The app reads ZIP, JSON, CSV, and text exports in the browser. It hashes your export and parses readable data. It flags unsafe paths and supported missing categories. You can download an HTML receipt or a signed JSON receipt. The app verifies whether a signed JSON receipt changed.

Exports are not uploaded. Category checks support Harbor Mail, Google Takeout, and Meta Download exports. If an export matches more than one layout, the receipt says so instead of guessing.

Exports must be 50 MB or smaller. ZIPs must contain at most 1,000 entries, expand to 50 MB or less, and stay below 100:1 compression. JSON and CSV files over 20 MB are inventoried but not parsed.

## Run

Requires Node 20 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/demo` or `http://localhost:5173/?demo=1` for the isolated sample. It reconstructs sample data in memory and stores nothing.

## Verify and build

```sh
npm test
npm run lint
npm run build
npm run verify:live -- https://export-receipt.sociobot.in artifacts/live
```

Browser tests cover every registered claim. They also check demo isolation, Back and Home navigation, limits, downloads, offline use, and keyboard access. Route metadata, the sitemap, the 404 page, and both color modes are checked too.

The static deploy output is `dist/`, with `index.html` at its root. Deploy that directory with the included `staticwebapp.config.json`.

## Privacy

Export Receipt has no account, analytics, server API, or export upload. Color mode is the only browser preference it stores outside demo mode. See `/privacy` and `/terms` in the app. It is released under the [MIT License](LICENSE).

## Catalog description

Check a data export before access ends, then keep a local receipt of files, dates, missing categories, and warnings.
