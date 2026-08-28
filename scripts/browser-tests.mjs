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
    await page.getByText('Missing category: Profile').waitFor();
    await context.close();
  }

  if (selected('@claim:local-only')) {
    const { context, page } = await freshPage();
    const external = [];
    context.on('request', (request) => { if (new URL(request.url()).origin !== baseURL) external.push(request.url()); });
    await page.goto(baseURL);
    await page.locator('#archive').setInputFiles({ name: 'export.json', mimeType: 'application/json', buffer: Buffer.from('[{"created_at":"2025-01-08"}]') });
    await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
    if (external.length) throw new Error(`Archive flow made an external request: ${external.join(', ')}`);
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
    const { context, page } = await freshPage();
    await demo(page);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download signed HTML receipt' }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    let output = '';
    for await (const chunk of stream) output += chunk;
    if (!output.includes('Signed by: Export Receipt local browser') || !output.includes('Signature:')) throw new Error('Downloaded HTML receipt has no visible signature evidence.');
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
    requests.length = 0;
    await page.getByRole('button', { name: 'Use light colors' }).click();
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await page.getByRole('heading', { name: 'Your export at a glance' }).waitFor();
    const during = await browserStorage(page);
    if (JSON.stringify(during) !== JSON.stringify(realBeforeDemo)) throw new Error(`Demo changed real browser data: ${JSON.stringify({ realBeforeDemo, during })}`);
    await page.getByRole('button', { name: 'Start for real' }).click();
    await page.locator('#archive').waitFor();
    if (new URL(page.url()).pathname !== '/' || await page.getByRole('region', { name: 'Demo controls' }).count()) throw new Error('Leaving the demo did not discard the sample workspace.');
    const after = await browserStorage(page);
    const demoTraffic = requests.filter((request) => request.method !== 'GET' || ['fetch', 'xhr', 'eventsource', 'websocket'].includes(request.type));
    if (JSON.stringify(after) !== JSON.stringify(realBeforeDemo) || demoTraffic.length) throw new Error(`Demo persisted data or made data requests: ${JSON.stringify({ after, demoTraffic })}`);
    await context.close();
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
      ['/', 'Export Receipt — Check your data export', '/', 'Check your export before access ends'],
      ['/demo', 'Demo — Export Receipt', '/demo', 'Your export at a glance'],
      ['/privacy', 'Privacy — Export Receipt', '/privacy', 'Your export stays on your device'],
      ['/terms', 'Terms — Export Receipt', '/terms', 'Use Export Receipt at your own pace'],
      ['/receipt', 'No receipt is open — Export Receipt', '/receipt', 'No receipt is open'],
    ];
    for (const [path, title, canonicalPath, heading] of routes) {
      const { context, page } = await freshPage();
      await page.goto(`${baseURL}${path}`);
      await page.getByRole('heading', { name: heading }).waitFor();
      const metadata = await page.evaluate(() => ({ title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'), description: document.querySelector('meta[name="description"]')?.getAttribute('content'), ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'), twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') }));
      if (metadata.title !== title || metadata.canonical !== `${canonicalOrigin}${canonicalPath}` || !metadata.description || metadata.ogTitle !== title || metadata.twitterTitle !== title) throw new Error(`Route metadata is incomplete for ${path}: ${JSON.stringify(metadata)}`);
      await context.close();
    }

    const { context: mobileContext, page: mobilePage } = await freshPage({ width: 390, height: 844 });
    await mobilePage.goto(baseURL);
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

    const { context: statusContext, page: statusPage } = await freshPage({ width: 390, height: 844 });
    await statusPage.goto(`${baseURL}/404.html`);
    await statusPage.getByRole('heading', { name: 'That page is not here' }).waitFor();
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
