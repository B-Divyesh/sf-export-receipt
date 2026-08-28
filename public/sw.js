const CACHE = 'export-receipt-__CACHE_ID__';
const APP = __APP_ASSETS__;
const APP_ROUTES = new Set(['/', '/demo', '/privacy', '/terms', '/receipt']);
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(Promise.all([
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('export-receipt-') && key !== CACHE).map((key) => caches.delete(key)))),
  self.clients.claim(),
])));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (event.request.mode === 'navigate' && requestUrl.origin === location.origin) {
    if (APP_ROUTES.has(requestUrl.pathname)) {
      event.respondWith(caches.open(CACHE).then((cache) => cache.match('/index.html')).then((page) => page || fetch(event.request).catch(() => caches.open(CACHE).then((cache) => cache.match('/offline.html')))));
    } else {
      event.respondWith(fetch(event.request).catch(async () => {
        const page = await caches.open(CACHE).then((cache) => cache.match('/404.html'));
        return page ? new Response(await page.text(), { status: 404, statusText: 'Not Found', headers: { 'Content-Type': 'text/html; charset=utf-8' } }) : Response.error();
      }));
    }
    return;
  }
  event.respondWith(caches.open(CACHE).then((cache) => cache.match(requestUrl.pathname)).then((cached) => cached || fetch(event.request).then((response) => { const copy = response.clone(); if (requestUrl.origin === location.origin) caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.open(CACHE).then((cache) => cache.match('/offline.html')))));
});
