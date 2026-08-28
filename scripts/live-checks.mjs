import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const baseURL = (process.argv[2] || 'https://export-receipt.sociobot.in').replace(/\/$/, '');
const evidenceDir = process.argv[3] || 'artifacts/live';
const origin = new URL(baseURL).origin;
mkdirSync(evidenceDir, { recursive: true });

const failures = [];
const consoleErrors = [];
const checks = [];
const isExpected404Console = (message) => /Failed to load resource: the server responded with a status of 404/.test(message);
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const record = (name, detail = 'pass') => checks.push({ name, detail });
const browser = await chromium.launch({ headless: true });

async function freshPage(viewport = { width: 390, height: 844 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  return { context, page };
}

async function storage(page) {
  return page.evaluate(async () => ({
    local: Object.fromEntries(Object.entries(localStorage)),
    session: Object.fromEntries(Object.entries(sessionStorage)),
    databases: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).map((database) => database.name) : [],
  }));
}

async function demo(page, path = '/demo') {
  await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
}

async function readDownload(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

try {
  const root = await freshPage();
  const rootResponse = await root.page.goto(baseURL, { waitUntil: 'networkidle' });
  assert(rootResponse?.status() === 200, `Cold root returned ${rootResponse?.status()}.`);
  await root.page.getByRole('heading', { name: 'Check your export before access ends' }).waitFor();
  assert(await root.page.evaluate(() => document.activeElement === document.body), 'Cold load moved focus away from the document start.');
  await root.page.screenshot({ path: `${evidenceDir}/polish-3-root-mobile.png`, fullPage: false });
  await root.page.keyboard.press('Tab');
  assert(await root.page.evaluate(() => document.activeElement?.textContent?.trim()) === 'Skip to inspection', 'Skip link is not the first Tab target.');
  await root.page.screenshot({ path: `${evidenceDir}/polish-3-focus-mobile.png`, fullPage: false });
  const firstScreenBottom = await root.page.locator('.hero-actions,.facts').evaluateAll((items) => Math.max(...items.map((item) => item.getBoundingClientRect().bottom)));
  assert(firstScreenBottom <= 844, `First-screen facts end at ${firstScreenBottom}px.`);
  for (const name of ['Demo', 'Privacy']) {
    const box = await root.page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name }).boundingBox();
    assert(box && box.width >= 44 && box.height >= 44, `Mobile ${name} target is under 44px.`);
  }
  record('cold first screen', `${Math.round(firstScreenBottom)}px bottom`);

  await root.page.getByRole('button', { name: 'Try it with sample data' }).click();
  await root.page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
  assert(new URL(root.page.url()).pathname === '/demo', 'One-click action did not open /demo.');
  assert(await root.page.getByRole('complementary', { name: 'Demo controls' }).count() === 1, 'Demo banner is missing.');
  assert(await root.page.locator('tbody tr').count() === 4, 'Demo does not show four sample files.');
  await root.page.getByText('2 successfully parsed JSON or CSV files; 1 attachment.').waitFor();
  await root.page.getByText('Date coverage: 2022-02-19 to 2025-01-08').waitFor();
  await root.page.getByText('Missing category: Profile').waitFor();
  assert(await root.page.evaluate(() => document.activeElement?.textContent?.trim()) === 'Your export at a glance', 'Demo route did not focus its h1.');
  await root.page.screenshot({ path: `${evidenceDir}/polish-3-demo-mobile.png`, fullPage: true });
  await root.page.goBack();
  await root.page.getByRole('heading', { name: 'Check your export before access ends' }).waitFor();
  assert(new URL(root.page.url()).pathname === '/' && await root.page.getByRole('complementary', { name: 'Demo controls' }).count() === 0, 'Back remained trapped in demo mode.');
  assert(await root.page.evaluate(() => document.activeElement?.tagName) === 'H1', 'Back did not focus the landing h1.');
  await root.page.screenshot({ path: `${evidenceDir}/polish-3-demo-back-mobile.png`, fullPage: false });
  await demo(root.page);
  await root.page.getByRole('link', { name: 'EXPORT RECEIPT' }).click();
  await root.page.getByRole('heading', { name: 'Check your export before access ends' }).waitFor();
  assert(new URL(root.page.url()).pathname === '/' && await root.page.getByRole('complementary', { name: 'Demo controls' }).count() === 0, 'Wordmark remained trapped in demo mode.');
  record('demo Back and Home', 'both return to / and discard the banner');
  await root.context.close();

  const isolated = await freshPage();
  const isolatedRequests = [];
  isolated.context.on('request', (request) => isolatedRequests.push({ url: request.url(), method: request.method(), type: request.resourceType() }));
  await isolated.page.goto(baseURL);
  await isolated.page.getByRole('button', { name: 'Use dark colors' }).click();
  const realBefore = await storage(isolated.page);
  await demo(isolated.page, '/?demo=1');
  assert(new URL(isolated.page.url()).pathname === '/demo', '?demo=1 did not normalize to /demo.');
  await isolated.page.getByRole('button', { name: 'Use light colors' }).click();
  await isolated.page.getByRole('button', { name: 'Reset demo' }).click();
  await isolated.page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
  assert(JSON.stringify(await storage(isolated.page)) === JSON.stringify(realBefore), 'Demo changed real storage during reset or color use.');
  await isolated.page.getByRole('button', { name: 'Start for real' }).click();
  await isolated.page.locator('#archive').waitFor();
  assert(JSON.stringify(await storage(isolated.page)) === JSON.stringify(realBefore), 'Demo changed real storage on exit.');
  const external = isolatedRequests.filter((request) => new URL(request.url).origin !== origin);
  const dataTraffic = isolatedRequests.filter((request) => request.method !== 'GET' || ['xhr', 'eventsource', 'websocket'].includes(request.type) || new URL(request.url).pathname.startsWith('/api/'));
  assert(!external.length && !dataTraffic.length && !(await isolated.context.cookies()).length, `Demo/privacy traffic was not local-only: ${JSON.stringify({ external, dataTraffic })}`);
  record('query demo and isolation', 'real storage unchanged; no external, API, credential, or non-GET traffic');
  await isolated.context.close();

  const receipts = await freshPage();
  await demo(receipts.page);
  const htmlPromise = receipts.page.waitForEvent('download');
  await receipts.page.getByRole('button', { name: 'Download HTML receipt' }).click();
  const html = (await readDownload(await htmlPromise)).toString('utf8');
  assert(['Export: harbor-mail-export.zip', 'SHA-256:', 'Missing category: Profile', 'Retest checklist'].every((value) => html.includes(value)), 'HTML receipt is missing promised evidence.');
  assert(!/Signed by:|<p>Signature:/.test(html), 'HTML receipt still implies it is signed.');
  const jsonPromise = receipts.page.waitForEvent('download');
  await receipts.page.getByRole('button', { name: 'Download signed JSON receipt' }).click();
  const jsonBuffer = await readDownload(await jsonPromise);
  const signed = JSON.parse(jsonBuffer.toString('utf8'));
  await receipts.page.locator('#verify-receipt').setInputFiles({ name: 'receipt.json', mimeType: 'application/json', buffer: jsonBuffer });
  await receipts.page.getByText('Valid signature. This receipt has not changed since this browser signed it.').waitFor();
  signed.name = 'tampered.zip';
  await receipts.page.locator('#verify-receipt').setInputFiles({ name: 'tampered.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(signed)) });
  await receipts.page.getByText('Invalid signature. This receipt changed or is not a signed Export Receipt JSON file.').waitFor();
  await receipts.page.locator('.checklist').scrollIntoViewIfNeeded();
  await receipts.page.screenshot({ path: `${evidenceDir}/polish-3-receipt-actions-mobile.png`, fullPage: false });
  record('receipt outputs', 'plain HTML evidence; signed JSON valid/tampered verification');
  await receipts.context.close();

  const routes = [
    { path: '/', title: 'Export Receipt — Check your data export', heading: 'Check your export before access ends', description: 'Inspect a data export before you lose access. Get a local receipt of what is present, missing, and readable.' },
    { path: '/demo', title: 'Demo — Export Receipt', heading: 'Your export at a glance', description: 'Try the Harbor Mail sample export. Nothing is saved.' },
    { path: '/privacy', title: 'Privacy — Export Receipt', heading: 'Your export stays on your device', description: 'Read how Export Receipt keeps exports on your device.' },
    { path: '/terms', title: 'Terms — Export Receipt', heading: 'Terms for using Export Receipt', description: 'Read the terms for using Export Receipt.' },
    { path: '/receipt', title: 'No receipt is open — Export Receipt', heading: 'No receipt is open', description: 'Choose an export or open the sample receipt.' },
  ];
  for (const route of routes) {
    const view = await freshPage();
    const response = await view.page.goto(`${baseURL}${route.path}`, { waitUntil: 'domcontentloaded' });
    assert(response?.status() === 200, `${route.path} returned ${response?.status()}.`);
    await view.page.getByRole('heading', { name: route.heading }).waitFor();
    const meta = await view.page.evaluate(() => ({ title: document.title, description: document.querySelector('meta[name="description"]')?.content, canonical: document.querySelector('link[rel="canonical"]')?.href, ogTitle: document.querySelector('meta[property="og:title"]')?.content, ogDescription: document.querySelector('meta[property="og:description"]')?.content, ogUrl: document.querySelector('meta[property="og:url"]')?.content, twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content, twitterDescription: document.querySelector('meta[name="twitter:description"]')?.content, h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main').length }));
    const expectedUrl = `${origin}${route.path}`;
    assert(meta.title === route.title && meta.description === route.description && meta.canonical === expectedUrl && meta.ogTitle === route.title && meta.ogDescription === route.description && meta.ogUrl === expectedUrl && meta.twitterTitle === route.title && meta.twitterDescription === route.description && meta.h1 === 1 && meta.main === 1, `${route.path} metadata/structure failed: ${JSON.stringify(meta)}`);
    const violations = (await new AxeBuilder({ page: view.page }).analyze()).violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
    assert(!violations.length, `${route.path} axe violations: ${violations.map((violation) => violation.id).join(', ')}`);
    const geometry = await view.page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    assert(geometry.viewport === geometry.content, `${route.path} overflows at 390px: ${JSON.stringify(geometry)}`);
    if (route.path === '/privacy') {
      const contact = view.page.getByRole('link', { name: 'Ask a question in the Export Receipt repository (opens in a new tab)' });
      assert(await contact.getAttribute('href') === 'https://github.com/B-Divyesh/sf-export-receipt/issues', 'Privacy contact destination is missing.');
      await view.page.screenshot({ path: `${evidenceDir}/polish-3-privacy-mobile.png`, fullPage: true });
    }
    if (route.path === '/terms') await view.page.screenshot({ path: `${evidenceDir}/polish-3-terms-mobile.png`, fullPage: true });
    if (route.path === '/receipt') await view.page.screenshot({ path: `${evidenceDir}/polish-3-receipt-empty-mobile.png`, fullPage: true });
    await view.context.close();
  }
  record('routes, metadata, legal, mobile, axe', `${routes.length} SPA routes passed direct cold checks`);

  const staticCheck = await freshPage();
  const sitemapResponse = await staticCheck.page.request.get(`${baseURL}/sitemap.xml`);
  const sitemap = await sitemapResponse.text();
  for (const route of routes) assert(sitemap.includes(`<loc>${origin}${route.path}</loc>`), `Sitemap omits ${route.path}.`);
  const missingResponse = await staticCheck.page.goto(`${baseURL}/does-not-exist-polish-3`, { waitUntil: 'networkidle' });
  assert(missingResponse?.status() === 404, `Unknown route returned ${missingResponse?.status()}.`);
  await staticCheck.page.getByRole('heading', { name: 'That page is not here' }).waitFor();
  assert(await staticCheck.page.getByRole('navigation', { name: 'Primary' }).count() === 1, '404 lacks shared navigation.');
  const missingViolations = (await new AxeBuilder({ page: staticCheck.page }).analyze()).violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
  assert(!missingViolations.length, `404 axe violations: ${missingViolations.map((violation) => violation.id).join(', ')}`);
  await staticCheck.page.screenshot({ path: `${evidenceDir}/polish-3-404-mobile.png`, fullPage: true });
  const headers = Object.fromEntries(Object.entries(rootResponse?.headers() || {}).map(([key, value]) => [key.toLowerCase(), value]));
  assert(headers['content-security-policy']?.includes("default-src 'self'") && headers['x-content-type-options'] === 'nosniff' && headers['referrer-policy'] === 'strict-origin-when-cross-origin', `Security headers are incomplete: ${JSON.stringify(headers)}`);
  record('sitemap, 404, headers', 'all routes listed; unknown URL is styled HTTP 404; CSP/nosniff/referrer policy present');
  await staticCheck.context.close();

  const offline = await freshPage();
  await demo(offline.page);
  await offline.page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await offline.context.setOffline(true);
  await offline.page.reload();
  await offline.page.getByRole('heading', { name: 'Your export at a glance' }).waitFor({ timeout: 10_000 });
  assert(await offline.page.locator('tbody tr').count() === 4, 'One-visit offline reload lost the sample receipt.');
  record('offline after one visit', 'complete four-file sample reloaded offline');
  await offline.context.close();

  const reduced = await freshPage();
  await reduced.page.emulateMedia({ reducedMotion: 'reduce' });
  await reduced.page.goto(baseURL);
  const transition = await reduced.page.getByRole('button', { name: 'Try it with sample data' }).evaluate((element) => getComputedStyle(element).transitionDuration);
  assert(parseFloat(transition) <= 0.001, `Reduced-motion transition is ${transition}.`);
  record('reduced motion', transition);
  await reduced.context.close();

  const unexpectedConsoleErrors = consoleErrors.filter((message) => !isExpected404Console(message));
  assert(!unexpectedConsoleErrors.length, `Console errors: ${unexpectedConsoleErrors.join(' | ')}`);
} catch (error) {
  failures.push(error instanceof Error ? error.stack || error.message : String(error));
} finally {
  await browser.close();
}

const result = { baseURL, checkedAt: new Date().toISOString(), passed: failures.length === 0, checks, consoleErrors: consoleErrors.filter((message) => !isExpected404Console(message)), expected404Console: consoleErrors.filter(isExpected404Console), failures };
writeFileSync(`${evidenceDir}/polish-3-verify.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
