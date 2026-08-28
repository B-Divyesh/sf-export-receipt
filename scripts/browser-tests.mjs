import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { preview } from 'vite';
import { zipSync } from 'fflate';

const grep = process.argv.includes('--grep') ? process.argv[process.argv.indexOf('--grep') + 1] : '';
const selected = (id) => !grep || grep.includes(id);
const baseURL = 'http://127.0.0.1:4173';
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
async function demo(page) {
  await page.goto(`${baseURL}/demo`);
  await page.getByRole('heading', { name: 'Your archive at a glance' }).waitFor();
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
    await page.getByRole('heading', { name: 'Your archive at a glance' }).waitFor();
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
      await page.getByRole('heading', { name: 'Your archive at a glance' }).waitFor();
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
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    await page.reload();
    await page.getByRole('heading', { name: 'Your archive at a glance' }).waitFor();
    await page.waitForTimeout(150);
    await context.setOffline(true);
    await page.reload();
    await page.getByRole('heading', { name: 'Your archive at a glance' }).waitFor({ timeout: 10_000 });
    await context.close();
  }

  if (selected('@claim:account-free')) {
    const { context, page } = await freshPage();
    const requests = [];
    context.on('request', (request) => requests.push({ url: request.url(), type: request.resourceType(), method: request.method() }));
    await page.goto(baseURL);
    if (await page.locator('input[type="password"], input[type="email"], form[action*="login"], form[action*="sign"]').count()) throw new Error('An account or credential control is present.');
    await page.locator('#archive').setInputFiles({ name: 'export.json', mimeType: 'application/json', buffer: Buffer.from('[{"created_at":"2025-01-08"}]') });
    await page.getByRole('heading', { name: 'Your archive at a glance' }).waitFor();
    await page.goto(`${baseURL}/demo`);
    await page.getByRole('heading', { name: 'Your archive at a glance' }).waitFor();
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
    await demo(page);
    requests.length = 0;
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await page.getByRole('heading', { name: 'Your archive at a glance' }).waitFor();
    const during = await browserStorage(page);
    if (Object.keys(during.local).length || Object.keys(during.session).length || during.databases.length) throw new Error(`Demo wrote browser data: ${JSON.stringify(during)}`);
    await page.getByRole('button', { name: 'Start for real' }).click();
    await page.locator('#archive').waitFor();
    if (new URL(page.url()).pathname !== '/' || await page.getByRole('region', { name: 'Demo controls' }).count()) throw new Error('Leaving the demo did not discard the sample workspace.');
    const after = await browserStorage(page);
    const demoTraffic = requests.filter((request) => request.method !== 'GET' || ['fetch', 'xhr', 'eventsource', 'websocket'].includes(request.type));
    if (Object.keys(after.local).length || Object.keys(after.session).length || after.databases.length || demoTraffic.length) throw new Error(`Demo persisted data or made data requests: ${JSON.stringify({ after, demoTraffic })}`);
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
      if (path === '/demo') await claimPage.getByRole('heading', { name: 'Your archive at a glance' }).waitFor();
      for (const value of await claimPage.locator('[data-claim]').evaluateAll((elements) => elements.map((element) => element.getAttribute('data-claim')))) {
        for (const id of value?.split(/\s+/) || []) annotatedClaims.add(id);
      }
    }
    const unknownClaims = [...annotatedClaims].filter((id) => !registeredClaims.has(id));
    const undocumentedClaims = [...registeredClaims].filter((id) => !annotatedClaims.has(id));
    if (unknownClaims.length || undocumentedClaims.length) throw new Error(`Visitor claim annotations and claims registry differ: ${JSON.stringify({ unknownClaims, undocumentedClaims })}`);
    await claimContext.close();

    const { context: keyboardContext, page: keyboardPage } = await freshPage();
    await keyboardPage.goto(baseURL);
    if (await keyboardPage.evaluate(() => document.activeElement !== document.body)) throw new Error('Initial load moved focus away from the document start.');
    await keyboardPage.keyboard.press('Tab');
    if (await keyboardPage.evaluate(() => document.activeElement?.textContent?.trim()) !== 'Skip to inspection') throw new Error('The skip link is not the first forward-Tab target.');
    await keyboardPage.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Privacy' }).click();
    await keyboardPage.getByRole('heading', { name: 'Your archive stays on your device' }).waitFor();
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
