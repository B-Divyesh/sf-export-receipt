import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { preview } from 'vite';
import { zipSync } from 'fflate';

const grep = process.argv.includes('--grep') ? process.argv[process.argv.indexOf('--grep') + 1] : '';
const selected = (id) => !grep || grep.includes(id);
const baseURL = 'http://127.0.0.1:4173';
const canonicalOrigin = 'https://export-receipt.sociobot.in';
const consoleErrors = [];
const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8'));

execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
const server = await preview({ preview: { host: '127.0.0.1', port: 4173, strictPort: true } });
const browser = await chromium.launch({ headless: true });

async function freshPage(viewport = { width: 1280, height: 800 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  return { context, page };
}
async function demo(page, path = '/demo') {
  await page.goto(`${baseURL}${path}`);
  await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
}
async function downloadJson(page) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download signed JSON receipt' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let output = '';
  for await (const chunk of stream) output += chunk;
  return JSON.parse(output);
}
async function browserStorage(page) {
  return page.evaluate(async () => ({
    local: Object.fromEntries(Object.entries(localStorage)),
    session: Object.fromEntries(Object.entries(sessionStorage)),
    databases: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).map((database) => database.name) : [],
  }));
}
async function setGeneratedFile(page, name, size) {
  await page.evaluate(({ fileName, fileSize }) => {
    const input = document.querySelector('#archive');
    if (!(input instanceof HTMLInputElement)) throw new Error('Archive input is missing.');
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(fileSize)], fileName, { type: 'application/octet-stream' }));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, { fileName: name, fileSize: size });
}

try {
  if (selected('@claim:sample-inventory')) {
    const { context, page } = await freshPage({ width: 390, height: 844 });
    await demo(page);
    await page.getByRole('heading', { name: 'File inventory' }).waitFor();
    if (await page.locator('tbody tr').count() !== 4) throw new Error('Demo inventory did not show four shipped sample files.');
    await page.getByText('2 successfully parsed JSON or CSV files; 1 attachment.').waitFor();
    await page.getByText('Date coverage: 2022-02-19 to 2025-01-08').waitFor();
    await page.getByText('Missing category: Profile').waitFor();
    await context.close();
  }

  if (selected('@claim:local-only')) {
    const { context, page } = await freshPage();
    const requests = [];
    context.on('request', (request) => requests.push({ url: request.url(), method: request.method(), type: request.resourceType() }));
    await page.goto(baseURL);
    await page.locator('#archive').setInputFiles({ name: 'export.json', mimeType: 'application/json', buffer: Buffer.from('[{"created_at":"2025-01-08"}]') });
    await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
    const external = requests.filter((request) => new URL(request.url).origin !== baseURL);
    const dataTraffic = requests.filter((request) => request.method !== 'GET' || ['xhr', 'eventsource', 'websocket'].includes(request.type) || new URL(request.url).pathname.startsWith('/api/'));
    if (external.length || dataTraffic.length) throw new Error(`Export flow made a data or external request: ${JSON.stringify({ external, dataTraffic })}`);
    await context.close();
  }

  if (selected('@claim:json-receipt')) {
    const { context, page } = await freshPage();
    await demo(page);
    const receipt = await downloadJson(page);
    if (!receipt.signature?.value || receipt.signature.signer !== 'Export Receipt local browser') throw new Error('JSON receipt has no local integrity signature.');
    const valid = await page.evaluate(async (signed) => {
      const { signature, ...payload } = signed;
      const base64 = signature.value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - signature.value.length % 4) % 4);
      const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
      const key = await crypto.subtle.importKey('jwk', signature.publicKeyJwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
      return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, bytes, new TextEncoder().encode(JSON.stringify(payload)));
    }, receipt);
    if (!valid || !receipt.retestChecklist?.length) throw new Error('Downloaded JSON receipt signature did not verify.');
    await context.close();
  }

  if (selected('@claim:html-receipt')) {
    const { context, page } = await freshPage({ width: 390, height: 844 });
    await demo(page);
    await page.locator('.checklist').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'artifacts/receipt-actions-mobile.png', fullPage: false });
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download HTML receipt' }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    let output = '';
    for await (const chunk of stream) output += chunk;
    const expected = ['Export: harbor-mail-export.zip', 'SHA-256:', 'Missing category: Profile', 'Retest checklist', 'Use the signed JSON receipt when you need to check for changes.'];
    if (!expected.every((value) => output.includes(value)) || /Signed by:|<p>Signature:/.test(output)) throw new Error('Downloaded HTML receipt does not contain the promised plain receipt evidence.');
    await context.close();
  }

  if (selected('@claim:supported-formats')) {
    const formats = [
      { name: 'records.json', mimeType: 'application/json', buffer: Buffer.from('[{"created_at":"2025-01-08"}]') },
      { name: 'records.csv', mimeType: 'text/csv', buffer: Buffer.from('created_at\n2025-01-08\n') },
      { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('created 2025-01-08') },
      { name: 'records.zip', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'records.json': new TextEncoder().encode('[{"created_at":"2025-01-08"}]') })) },
    ];
    for (const input of formats) {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      await page.locator('#archive').setInputFiles(input);
      await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
      await context.close();
    }
  }

  if (selected('@claim:source-hash')) {
    const { context, page } = await freshPage();
    await demo(page);
    await page.getByText(/SHA-256 [a-f0-9]{12}/).waitFor();
    await context.close();
  }

  if (selected('@claim:parse-errors')) {
    const { context, page } = await freshPage();
    await page.goto(baseURL);
    await page.locator('#archive').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
    await page.getByText('Unreadable JSON: broken.json').waitFor();
    await context.close();
  }

  if (selected('@claim:offline-reload')) {
    const { context, page } = await freshPage();
    await demo(page);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (!registrations.some((registration) => registration.active)) throw new Error('The service worker did not activate after the first visit.');
    });
    await context.setOffline(true);
    await page.reload();
    await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor({ timeout: 10_000 });
    await context.close();
  }

  if (selected('@claim:account-free')) {
    const { context, page } = await freshPage();
    const requests = [];
    context.on('request', (request) => requests.push({ url: request.url(), type: request.resourceType(), method: request.method() }));
    await page.goto(baseURL);
    if (await page.locator('input[type="password"], input[type="email"], form[action*="login"], form[action*="sign"]').count()) throw new Error('An account or credential control is present.');
    await page.locator('#archive').setInputFiles({ name: 'export.json', mimeType: 'application/json', buffer: Buffer.from('[{"created_at":"2025-01-08"}]') });
    await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
    await page.goto(`${baseURL}/demo`);
    await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
    const cookies = await context.cookies();
    const external = requests.filter((request) => new URL(request.url).origin !== baseURL);
    const apiTraffic = requests.filter((request) => request.method !== 'GET' || ['xhr', 'eventsource', 'websocket'].includes(request.type) || new URL(request.url).pathname.startsWith('/api/'));
    if (cookies.length || external.length || apiTraffic.length) throw new Error(`Account-free flow used cookies, external traffic, or an API: ${JSON.stringify({ cookies, external, apiTraffic })}`);
    await context.close();
  }

  if (selected('@claim:preference-storage')) {
    const { context, page } = await freshPage();
    await page.goto(baseURL);
    const before = await browserStorage(page);
    if (Object.keys(before.local).length || Object.keys(before.session).length || before.databases.length) throw new Error(`Fresh browser storage was not empty: ${JSON.stringify(before)}`);
    await page.getByRole('button', { name: 'Use dark colors' }).click();
    if (await page.evaluate(() => document.activeElement?.textContent?.trim()) !== 'Use light colors') throw new Error('The color control lost keyboard focus after changing the theme.');
    const after = await browserStorage(page);
    if (JSON.stringify(after.local) !== JSON.stringify({ 'export-receipt:theme': 'dark' }) || Object.keys(after.session).length || after.databases.length) throw new Error(`Color mode stored unexpected browser data: ${JSON.stringify(after)}`);
    await page.reload();
    await page.getByRole('button', { name: 'Use light colors' }).waitFor();
    await context.close();
  }

  if (selected('@claim:demo-isolation')) {
    const { context, page } = await freshPage();
    const requests = [];
    context.on('request', (request) => requests.push({ url: request.url(), type: request.resourceType(), method: request.method() }));
    await page.goto(baseURL);
    await page.getByRole('button', { name: 'Use dark colors' }).click();
    const realBeforeDemo = await browserStorage(page);
    await demo(page, '/?demo=1');
    if (new URL(page.url()).pathname !== '/demo') throw new Error('The documented ?demo=1 entry did not open the isolated demo.');
    if (await page.getByRole('complementary', { name: 'Demo controls' }).count() !== 1) throw new Error('The documented demo entry did not show its persistent banner.');
    requests.length = 0;
    await page.getByRole('button', { name: 'Use light colors' }).click();
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
    if (await page.evaluate(() => document.activeElement?.textContent?.trim()) !== 'Your export at a glance') throw new Error('Reset demo did not return focus to the rebuilt receipt heading.');
    const during = await browserStorage(page);
    if (JSON.stringify(during) !== JSON.stringify(realBeforeDemo)) throw new Error(`Demo changed real browser data: ${JSON.stringify({ realBeforeDemo, during })}`);
    await page.getByRole('button', { name: 'Start for real' }).click();
    await page.locator('#archive').waitFor();
    if (new URL(page.url()).pathname !== '/' || await page.getByRole('complementary', { name: 'Demo controls' }).count()) throw new Error('Leaving the demo did not discard the sample workspace.');
    const after = await browserStorage(page);
    const demoTraffic = requests.filter((request) => request.method !== 'GET' || ['fetch', 'xhr', 'eventsource', 'websocket'].includes(request.type));
    if (JSON.stringify(after) !== JSON.stringify(realBeforeDemo) || demoTraffic.length) throw new Error(`Demo persisted data or made data requests: ${JSON.stringify({ after, demoTraffic })}`);
    await context.close();

    const back = await freshPage({ width: 390, height: 844 });
    await back.page.goto(baseURL);
    await back.page.getByRole('button', { name: 'Try it with sample data' }).click();
    await back.page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
    if (await back.page.evaluate(() => document.activeElement?.textContent?.trim()) !== 'Your export at a glance') throw new Error('Entering the demo did not move focus to its final heading.');
    await back.page.goBack();
    await back.page.getByRole('heading', { name: 'Check your export before access ends' }).waitFor();
    if (new URL(back.page.url()).pathname !== '/' || await back.page.getByRole('complementary', { name: 'Demo controls' }).count()) throw new Error('Browser Back did not leave the demo and discard its sample workspace.');
    if (await back.page.evaluate(() => document.activeElement?.tagName) !== 'H1') throw new Error('Browser Back from the demo did not move focus to the landing heading.');
    await back.page.locator('.hero-art img').evaluate((image) => image.complete ? undefined : new Promise((resolve) => image.addEventListener('load', resolve, { once: true })));
    await back.page.screenshot({ path: 'artifacts/demo-exit-mobile.png', fullPage: false });
    await back.context.close();

    const home = await freshPage({ width: 390, height: 844 });
    await demo(home.page);
    await home.page.getByRole('link', { name: 'EXPORT RECEIPT' }).click();
    await home.page.getByRole('heading', { name: 'Check your export before access ends' }).waitFor();
    if (new URL(home.page.url()).pathname !== '/' || await home.page.getByRole('complementary', { name: 'Demo controls' }).count()) throw new Error('The wordmark did not leave the demo and discard its sample workspace.');
    if (await home.page.evaluate(() => document.activeElement?.tagName) !== 'H1') throw new Error('The wordmark route did not move focus to the landing heading.');
    await home.context.close();
  }

  if (selected('@claim:recognized-layouts')) {
    const fixtures = [
      { name: 'harbor.zip', entries: { 'account/messages.json': '[]', 'account/contacts.csv': 'name\nMara\n', 'account/profile.json': '{}', 'media/a.jpg': 'x' }, matched: 'Harbor Mail export' },
      { name: 'takeout.zip', entries: { 'Takeout/My Activity/a.json': '[]', 'Takeout/Contacts/a.csv': 'name\nMara\n', 'Takeout/Google Photos/a.jpg': 'x' }, matched: 'Google Takeout' },
      { name: 'meta.zip', entries: { 'profile_information/a.json': '{}', 'messages/a.json': '[]', 'photos_and_videos/a.jpg': 'x' }, matched: 'Meta download' },
    ];
    for (const fixture of fixtures) {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      await page.locator('#archive').setInputFiles({ name: fixture.name, mimeType: 'application/zip', buffer: Buffer.from(zipSync(Object.fromEntries(Object.entries(fixture.entries).map(([name, content]) => [name, new TextEncoder().encode(content)])))) });
      await page.getByText(`Layout matched: ${fixture.matched}`).waitFor();
      await context.close();
    }
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      await page.locator('#archive').setInputFiles({ name: 'missing-meta.zip', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'profile_information/a.json': new TextEncoder().encode('{}'), 'messages/a.json': new TextEncoder().encode('[]') })) });
      await page.getByText('Missing category: Photos and videos').waitFor();
      await context.close();
    }
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      await page.locator('#archive').setInputFiles({ name: 'ambiguous.zip', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'Takeout/My Activity/a.json': new TextEncoder().encode('[]'), 'messages/a.json': new TextEncoder().encode('[]') })) });
      await page.getByText('Ambiguous export layout').first().waitFor();
      await context.close();
    }
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      await page.locator('#archive').setInputFiles({ name: 'other.zip', mimeType: 'application/zip', buffer: Buffer.from(zipSync({ 'notes/a.json': new TextEncoder().encode('[]') })) });
      await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
      if (await page.getByText('Layout matched:').count()) throw new Error('A non-matching export was assigned a supported layout.');
      await context.close();
    }
  }

  if (selected('@claim:receipt-verification')) {
    const { context, page } = await freshPage();
    await demo(page);
    const receipt = await downloadJson(page);
    await page.locator('#verify-receipt').setInputFiles({ name: 'receipt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(receipt)) });
    await page.getByText('Valid signature. This receipt has not changed since this browser signed it.').waitFor();
    receipt.name = 'tampered-export.zip';
    await page.locator('#verify-receipt').setInputFiles({ name: 'tampered.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(receipt)) });
    await page.getByText('Invalid signature. This receipt changed or is not a signed Export Receipt JSON file.').waitFor();
    await context.close();
  }

  if (selected('@claim:safe-archive-limits')) {
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      const unsafe = Buffer.from(zipSync({ '../escape.json': new TextEncoder().encode('[]') }));
      await page.locator('#archive').setInputFiles({ name: 'unsafe.zip', mimeType: 'application/zip', buffer: unsafe });
      await page.getByText('Unsafe path: ../escape.json').waitFor();
      await context.close();
    }
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      await setGeneratedFile(page, 'too-large.json', 50 * 1024 * 1024 + 1);
      await page.getByText('This export is larger than the 50 MB safe inspection limit. Split it into smaller exports before checking it.').waitFor();
      await context.close();
    }
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      const entries = Object.fromEntries(Array.from({ length: 1001 }, (_, index) => [`entry-${index}.txt`, new Uint8Array()]));
      await page.locator('#archive').setInputFiles({ name: 'too-many.zip', mimeType: 'application/zip', buffer: Buffer.from(zipSync(entries)) });
      await page.getByText('This ZIP exceeds safe inspection limits. Choose an export with fewer than 1,000 files and less than 50 MB expanded data.').waitFor();
      await context.close();
    }
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      const expanded = zipSync({ 'small.txt': new TextEncoder().encode('ok') });
      const signature = [0x50, 0x4b, 0x01, 0x02];
      const offset = expanded.findIndex((_, index) => signature.every((value, part) => expanded[index + part] === value));
      new DataView(expanded.buffer, expanded.byteOffset, expanded.byteLength).setUint32(offset + 24, 50 * 1024 * 1024 + 1, true);
      await page.locator('#archive').setInputFiles({ name: 'expanded.zip', mimeType: 'application/zip', buffer: Buffer.from(expanded) });
      await page.getByText('This ZIP exceeds safe inspection limits. Choose an export with fewer than 1,000 files and less than 50 MB expanded data.').waitFor();
      await context.close();
    }
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      const highRatio = zipSync({ 'zeros.txt': new Uint8Array(1024 * 1024) }, { level: 9 });
      await page.locator('#archive').setInputFiles({ name: 'high-ratio.zip', mimeType: 'application/zip', buffer: Buffer.from(highRatio) });
      await page.getByText('This ZIP exceeds safe inspection limits. Choose an export with fewer than 1,000 files and less than 50 MB expanded data.').waitFor();
      await context.close();
    }
    {
      const { context, page } = await freshPage();
      await page.goto(baseURL);
      await setGeneratedFile(page, 'oversize-text.json', 20 * 1024 * 1024 + 1);
      await page.getByText('Data file too large: oversize-text.json').waitFor();
      await context.close();
    }
  }

  if (!grep) {
    const source = readFileSync('scripts/browser-tests.mjs', 'utf8');
    for (const claim of claims) {
      if (claim.test !== `npm test -- --grep @claim:${claim.id}`) throw new Error(`Claim ${claim.id} has a non-standard test command.`);
      const occurrences = source.split(`selected('@claim:${claim.id}')`).length - 1;
      if (occurrences !== 1) throw new Error(`Claim ${claim.id} must have exactly one browser test; found ${occurrences}.`);
    }
    const registeredClaims = new Set(claims.map((claim) => claim.id));
    const annotatedClaims = new Set();
    const { context: claimContext, page: claimPage } = await freshPage();
    for (const path of ['/', '/privacy', '/demo']) {
      await claimPage.goto(`${baseURL}${path}`);
      if (path === '/demo') await claimPage.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
      for (const value of await claimPage.locator('[data-claim]').evaluateAll((elements) => elements.map((element) => element.getAttribute('data-claim')))) {
        for (const id of value?.split(/\s+/) || []) annotatedClaims.add(id);
      }
    }
    const unknownClaims = [...annotatedClaims].filter((id) => !registeredClaims.has(id));
    const undocumentedClaims = [...registeredClaims].filter((id) => !annotatedClaims.has(id));
    if (unknownClaims.length || undocumentedClaims.length) throw new Error(`Visitor claim annotations and claims registry differ: ${JSON.stringify({ unknownClaims, undocumentedClaims })}`);
    await claimContext.close();

    const routes = [
      { path: '/', title: 'Export Receipt — Check your data export', heading: 'Check your export before access ends', description: 'Inspect a data export before you lose access. Get a local receipt of what is present, missing, and readable.' },
      { path: '/demo', title: 'Demo — Export Receipt', heading: 'Your export at a glance', description: 'Try the Harbor Mail sample export. Nothing is saved.' },
      { path: '/privacy', title: 'Privacy — Export Receipt', heading: 'Your export stays on your device', description: 'Read how Export Receipt keeps exports on your device.' },
      { path: '/terms', title: 'Terms — Export Receipt', heading: 'Terms for using Export Receipt', description: 'Read the terms for using Export Receipt.' },
      { path: '/receipt', title: 'No receipt is open — Export Receipt', heading: 'No receipt is open', description: 'Choose an export or open the sample receipt.' },
    ];
    for (const { path, title, heading, description } of routes) {
      const { context, page } = await freshPage({ width: 390, height: 844 });
      await page.goto(`${baseURL}${path}`);
      await page.getByRole('heading', { name: heading }).waitFor();
      const metadata = await page.evaluate(() => ({ title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'), description: document.querySelector('meta[name="description"]')?.getAttribute('content'), ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'), ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'), ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content'), twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'), twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content'), h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main').length, header: document.querySelectorAll('header').length, footer: document.querySelectorAll('footer').length }));
      const expectedUrl = `${canonicalOrigin}${path}`;
      if (metadata.title !== title || metadata.canonical !== expectedUrl || metadata.description !== description || metadata.ogTitle !== title || metadata.ogDescription !== description || metadata.ogUrl !== expectedUrl || metadata.twitterTitle !== title || metadata.twitterDescription !== description || metadata.h1 !== 1 || metadata.main !== 1 || metadata.header !== 1 || metadata.footer !== 1) throw new Error(`Route structure or metadata is incomplete for ${path}: ${JSON.stringify(metadata)}`);
      const routeViolations = (await new AxeBuilder({ page }).analyze()).violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
      const routeGeometry = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      if (routeViolations.length || routeGeometry.content !== routeGeometry.viewport) throw new Error(`Route accessibility or mobile overflow failed for ${path}: ${JSON.stringify({ routeViolations: routeViolations.map((violation) => violation.id), routeGeometry })}`);
      await context.close();
    }

    const sitemap = readFileSync('public/sitemap.xml', 'utf8');
    const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/export-receipt\.sociobot\.in(\/[^<]*)<\/loc>/g)].map((match) => match[1]);
    const routePaths = routes.map((route) => route.path);
    if (JSON.stringify(sitemapPaths.sort()) !== JSON.stringify(routePaths.sort())) throw new Error(`Sitemap and SPA routes differ: ${JSON.stringify({ sitemapPaths, routePaths })}`);
    const robots = readFileSync('public/robots.txt', 'utf8');
    if (!robots.includes('Sitemap: https://export-receipt.sociobot.in/sitemap.xml')) throw new Error('robots.txt does not publish the sitemap URL.');
    const catalog = readFileSync('.factory/catalog-description.txt', 'utf8').trim();
    if (catalog.length > 120 || !catalog.startsWith('Check ')) throw new Error(`Catalog description is not verb-first or exceeds 120 characters: ${catalog.length} ${catalog}`);

    const { context: mobileContext, page: mobilePage } = await freshPage({ width: 390, height: 844 });
    await mobilePage.goto(baseURL);
    await mobilePage.getByRole('heading', { name: 'Check your export before access ends' }).waitFor();
    await mobilePage.getByText('For people leaving a service, see what your export contains before an account disappears.').waitFor();
    await mobilePage.getByRole('button', { name: 'Try it with sample data' }).waitFor();
    await mobilePage.getByText('Loads a sample receipt now.').waitFor();
    const landingCopy = await mobilePage.locator('main h1, main h2, main p, main figcaption, main .steps span, main .facts li, main button').allTextContents();
    const bannedCopy = /\b(leverage|seamless|effortless|robust|powerful|intuitive|reimagine|supercharge|unlock|delightful|journey|ecosystem|AI-powered)\b/i;
    const longSentences = landingCopy.flatMap((copy) => copy.split(/(?<=[.!?])\s+/)).map((copy) => copy.trim()).filter(Boolean).filter((copy) => copy.split(/\s+/).length > 22);
    if (landingCopy.some((copy) => bannedCopy.test(copy)) || longSentences.length) throw new Error(`Landing copy failed the plain-words audit: ${JSON.stringify(longSentences)}`);
    const firstScreenBottom = await mobilePage.locator('.hero-actions,.facts').evaluateAll((items) => Math.max(...items.map((item) => item.getBoundingClientRect().bottom)));
    if (firstScreenBottom > 844) throw new Error(`The mobile first-screen action outcome or facts are below the viewport (${firstScreenBottom}px).`);
    await mobilePage.screenshot({ path: 'artifacts/mobile-first-screen.png', fullPage: false });
    await mobileContext.close();

    const { context: mobileNavigationContext, page: mobileNavigationPage } = await freshPage({ width: 390, height: 844 });
    await mobileNavigationPage.goto(baseURL);
    for (const [name, path, heading] of [
      ['Demo', '/demo', 'Your export at a glance'],
      ['Privacy', '/privacy', 'Your export stays on your device'],
    ]) {
      const link = mobileNavigationPage.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name });
      const box = await link.boundingBox();
      if (!box || box.width < 44 || box.height < 44) throw new Error(`Mobile header ${name} link is not a usable 44px target.`);
      await link.click();
      await mobileNavigationPage.getByRole('heading', { name: heading }).waitFor();
      if (new URL(mobileNavigationPage.url()).pathname !== path) throw new Error(`Mobile header ${name} link did not navigate to ${path}.`);
      if (path !== '/') await mobileNavigationPage.goto(baseURL);
    }
    await mobileNavigationContext.close();

    const { context: legalContext, page: legalPage } = await freshPage({ width: 390, height: 844 });
    await legalPage.goto(`${baseURL}/privacy`);
    const contact = legalPage.getByRole('link', { name: 'Ask a question in the Export Receipt repository (opens in a new tab)' });
    if (await contact.getAttribute('href') !== 'https://github.com/B-Divyesh/sf-export-receipt/issues' || await contact.getAttribute('target') !== '_blank') throw new Error('The privacy contact link does not provide the verified repository destination.');
    await legalPage.screenshot({ path: 'artifacts/privacy-mobile.png', fullPage: false });
    await legalPage.goto(`${baseURL}/terms`);
    await legalPage.getByRole('heading', { name: 'Terms for using Export Receipt' }).waitFor();
    await legalPage.screenshot({ path: 'artifacts/terms-mobile.png', fullPage: false });
    await legalContext.close();

    const { context: statusContext, page: statusPage } = await freshPage({ width: 390, height: 844 });
    await statusPage.goto(`${baseURL}/404.html`);
    await statusPage.getByRole('heading', { name: 'That page is not here' }).waitFor();
    const statusMetadata = await statusPage.evaluate(() => ({ title: document.title, description: document.querySelector('meta[name="description"]')?.getAttribute('content'), canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'), ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'), ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'), ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content'), twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'), twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') }));
    if (JSON.stringify(statusMetadata) !== JSON.stringify({ title: 'Page not found — Export Receipt', description: 'This Export Receipt page is not available.', canonical: `${canonicalOrigin}/404`, ogTitle: 'Page not found — Export Receipt', ogDescription: 'This Export Receipt page is not available.', ogUrl: `${canonicalOrigin}/404`, twitterTitle: 'Page not found — Export Receipt', twitterDescription: 'This Export Receipt page is not available.' })) throw new Error(`The 404 metadata is incomplete: ${JSON.stringify(statusMetadata)}`);
    const statusViolations = (await new AxeBuilder({ page: statusPage }).analyze()).violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
    if (statusViolations.length || await statusPage.getByRole('navigation', { name: 'Primary' }).count() !== 1) throw new Error(`The 404 page is not accessible or lacks shared navigation: ${statusViolations.map((violation) => violation.id).join(', ')}`);
    const statusTargets = await statusPage.locator('a').evaluateAll((items) => items.filter((item) => { const rect = item.getBoundingClientRect(); const style = getComputedStyle(item); return style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 44 || rect.height < 44); }).map((item) => item.textContent?.trim()));
    if (statusTargets.length) throw new Error(`404 targets under 44px: ${statusTargets.join(', ')}`);
    await statusPage.screenshot({ path: 'artifacts/404-local.png', fullPage: false });
    await statusContext.close();

    const staticConfig = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));
    if (staticConfig.responseOverrides?.['404']?.rewrite !== '/404.html') throw new Error('Static deployment does not route unknown URLs to the designed 404 page.');

    const { context: keyboardContext, page: keyboardPage } = await freshPage();
    await keyboardPage.goto(baseURL);
    if (await keyboardPage.evaluate(() => document.activeElement !== document.body)) throw new Error('Initial load moved focus away from the document start.');
    await keyboardPage.keyboard.press('Tab');
    if (await keyboardPage.evaluate(() => document.activeElement?.textContent?.trim()) !== 'Skip to inspection') throw new Error('The skip link is not the first forward-Tab target.');
    await keyboardPage.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Privacy' }).click();
    await keyboardPage.getByRole('heading', { name: 'Your export stays on your device' }).waitFor();
    if (await keyboardPage.evaluate(() => document.activeElement?.tagName) !== 'H1') throw new Error('A client-side route change did not move focus to its heading.');
    await keyboardContext.close();

    for (const dark of [false, true]) {
      const { context, page } = await freshPage({ width: 390, height: 844 });
      await demo(page);
      if (dark) await page.getByRole('button', { name: 'Use dark colors' }).click();
      const violations = (await new AxeBuilder({ page }).analyze()).violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
      if (violations.length) throw new Error(`Axe found serious violations (${dark ? 'dark' : 'light'}): ${violations.map((violation) => `${violation.id} ${violation.nodes.flatMap((node) => node.target).join(', ')}`).join('; ')}`);
      const shortTargets = await page.locator('button, a').evaluateAll((items) => items.filter((item) => { const rect = item.getBoundingClientRect(); const style = getComputedStyle(item); return !item.closest('[hidden]') && style.display !== 'none' && style.visibility !== 'hidden' && (rect.width < 44 || rect.height < 44); }).map((item) => item.textContent?.trim()));
      if (shortTargets.length) throw new Error(`Interactive targets under 44px: ${shortTargets.join(', ')}`);
      await page.keyboard.press('Tab');
      await page.getByRole('region', { name: 'File inventory. Use arrow keys to scroll the table.' }).focus();
      await context.close();
    }
  }
  if (consoleErrors.length) throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`);
  console.log(`Browser checks passed${grep ? ` for ${grep}` : ''}.`);
} finally {
  await browser.close();
  await server.close();
}
