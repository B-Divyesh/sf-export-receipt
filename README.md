# Export Receipt

Check a data export before access ends. It is for people leaving a service or making a backup who need a plain local receipt of files, dates, attachments, unreadable data, and next checks.

Everything happens in the browser. Export Receipt accepts standard ZIP, JSON, CSV, and text exports. It hashes the selected source, inventories readable files, flags unsafe paths and parse errors, then downloads an HTML or JSON receipt. It does not log in, upload archives, scrape services, or move data.

## Run

Requires Node 20 or newer.

```sh
npm install
npm run dev
```

Open `http://localhost:5173/demo` for the isolated sample. The demo rebuilds its sample in memory and saves nothing.

## Test and build

```sh
npm test
npm run build
```

The static deployment folder is `dist/`, with `index.html` at its root. Deploy it as a static web app with the included `staticwebapp.config.json`.

## Privacy

The app makes no archive upload or analytics request. The only optional browser setting is the chosen color mode. See `/privacy` and `/terms` in the app.

## Catalog description

Check a data export before access ends with a local receipt of files, dates, and warnings.

Live: https://export-receipt.sociobot.in — built by the Param Factory (`pwa-offline`).

See `.factory/brief.json` for the researched problem this solves and `.factory/design.md` for the visual system.

## Develop

```
npm install
npm run dev
npm test
npm run build   # -> dist/
```
