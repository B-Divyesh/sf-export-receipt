import { readFile, readdir, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const entry = Object.values(manifest).find((asset) => asset.isEntry);
if (!entry) throw new Error('Vite manifest has no application entry.');
const emitted = [...new Set([...Object.values(manifest).flatMap((asset) => [asset.file, ...(asset.css || [])]), ...(await readdir('dist/assets')).map((file) => `assets/${file}`)])];
const assets = [...new Set(['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png', '/icon-512.png', '/offline.html', '/status.css', ...emitted.map((file) => `/${file}`)])];
const source = await readFile('dist/sw.js', 'utf8');
const cacheId = entry.file.replace(/[^a-z0-9]/gi, '-');
await writeFile('dist/sw.js', source.replace('__CACHE_ID__', cacheId).replace('__APP_ASSETS__', JSON.stringify(assets)));
