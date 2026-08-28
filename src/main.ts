import './style.css';
import './asset-overrides.css';
import { inspectFile, receiptData, sampleInspection } from './inspect';
import type { Inspection } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
let inspection: Inspection | null = null;
let demo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
let dark = localStorage.getItem('export-receipt:theme') === 'dark';

const bytes = (n: number) => n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`;
const escape = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

function route(path: string) { history.pushState({}, '', path); render(); }
window.addEventListener('popstate', render);

function shell(content: string, pageTitle: string, h1: string) {
  document.title = pageTitle;
  app.dataset.theme = dark ? 'dark' : 'light';
  app.innerHTML = `<header class="site-header"><a class="wordmark" href="/" data-link>EXPORT <span>RECEIPT</span></a><nav aria-label="Primary"><a href="/demo" data-link>Demo</a><a href="/#how">How it works</a><a href="/privacy" data-link>Privacy</a><button class="theme-toggle" type="button" aria-label="Use ${dark ? 'light' : 'dark'} colors">${dark ? 'Light' : 'Dark'}</button></nav></header><div id="announce" class="sr-only" aria-live="polite"></div><main id="main" tabindex="-1">${content}</main><footer><p>Export Receipt checks local exports before access disappears.</p><p><a href="/privacy" data-link>Privacy</a> · <a href="/terms" data-link>Terms</a> · Built by Param Factory · v1.0.0</p></footer><div id="update-toast" hidden><span>An update is ready.</span><button type="button">Reload</button></div>`;
  app.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); route(link.pathname); }));
  app.querySelector('.theme-toggle')?.addEventListener('click', () => { dark = !dark; localStorage.setItem('export-receipt:theme', dark ? 'dark' : 'light'); render(); });
  app.querySelector('#update-toast button')?.addEventListener('click', () => location.reload());
  queueMicrotask(() => { const heading = document.querySelector<HTMLElement>('h1'); if (heading) { heading.tabIndex = -1; heading.focus(); } document.querySelector('#announce')!.textContent = h1; });
}

function demoBar() { return demo ? `<aside class="demo-bar" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><button data-reset>Reset demo</button><button data-real>Start for real</button></aside>` : ''; }

function landing() {
  shell(`<section class="hero"><div class="hero-copy"><p class="kicker">LOCAL ARCHIVE CHECK</p><h1>Check your export before access ends</h1><p class="lede">For people leaving a service, see what your archive contains before an account disappears.</p><div class="hero-actions"><button class="primary" data-demo>Try it with sample data</button><span>Loads a sample receipt now.</span></div><ul class="facts"><li>Runs in your browser</li><li>Works offline after first visit</li><li>Free to use</li></ul></div><figure class="hero-art"><img src="/archive-workbench.webp" width="768" height="768" fetchpriority="high" decoding="async" alt="An archive folder, magnifier, and printed data receipt on a workbench."><figcaption>Generated product illustration: inspect the archive, then keep the receipt.</figcaption></figure></section><section class="workbench" aria-labelledby="bench-title"><div><p class="kicker">THE RECEIPT DESK</p><h2 id="bench-title">Open an export to make a receipt</h2><p>Choose a ZIP, JSON, CSV, or text file. Nothing is uploaded.</p></div><label class="drop-zone" for="archive"><span>Choose an export</span><small>ZIP · JSON · CSV · TXT</small><input id="archive" type="file" accept=".zip,.json,.csv,.txt,text/plain,application/zip" /></label><p class="error" role="status" aria-live="polite"></p></section><section id="how" class="steps" aria-labelledby="how-title"><h2 id="how-title">How Export Receipt checks an archive</h2><ol><li><strong>Choose</strong><span>Open an export on this device.</span></li><li><strong>Inspect</strong><span>Count files, dates, attachments, and parse errors.</span></li><li><strong>Keep</strong><span>Download an HTML or JSON receipt with next checks.</span></li></ol></section><section class="limits" aria-labelledby="limits-title"><h2 id="limits-title">What this does not do</h2><p>It does not log in, scrape accounts, move data, or decide legal compliance. It flags what it can see.</p></section>`, 'Export Receipt — Check your data export', 'Check your export before access ends');
  app.querySelector('[data-demo]')?.addEventListener('click', enterDemo);
  app.querySelector<HTMLInputElement>('#archive')?.addEventListener('change', handleFile);
}

function report() {
  if (!inspection) return landing();
  const readable = inspection.files.filter((f) => f.kind === 'JSON' || f.kind === 'CSV');
  const dateFinding = inspection.findings.find((f) => f.title.startsWith('Date coverage'));
  shell(`${demoBar()}<section class="report-head"><div><p class="kicker">INSPECTION RECEIPT</p><h1>Your archive at a glance</h1><p class="lede">Keep this with the original archive. Recheck warnings before you close an account.</p></div><div class="stamp">${inspection.source === 'sample' ? 'SAMPLE' : 'CHECKED'}<small>${new Date(inspection.inspectedAt).toLocaleDateString()}</small></div></section><section class="summary" aria-label="Inspection summary"><article><span>Archive</span><strong>${escape(inspection.name)}</strong><small>${bytes(inspection.bytes)} · SHA-256 ${inspection.hash.slice(0, 12)}…</small></article><article><span>Readable files</span><strong>${readable.length}</strong><small>JSON or CSV</small></article><article><span>Date coverage</span><strong>${dateFinding ? escape(dateFinding.title.replace('Date coverage: ', '')) : 'Not found'}</strong><small>From readable content</small></article></section><div class="report-grid"><section class="receipt" aria-labelledby="findings-title"><div class="section-title"><h2 id="findings-title">What needs your attention</h2><span>${inspection.findings.filter((f) => f.level !== 'ok' && f.level !== 'info').length} checks</span></div><ul class="findings">${inspection.findings.map((f) => `<li class="${f.level}"><b>${f.level === 'ok' ? '✓' : f.level === 'warn' ? '!' : f.level === 'danger' ? '×' : 'i'}</b><div><strong>${escape(f.title)}</strong><p>${escape(f.detail)}</p></div></li>`).join('')}</ul></section><aside class="checklist"><h2>Retest checklist</h2><ol>${receiptData(inspection).retestChecklist.map((x) => `<li>${escape(x)}</li>`).join('')}</ol><button class="secondary" data-json>Download JSON receipt</button><button class="primary" data-html>Download HTML receipt</button><button class="text-button" data-another>Check another export</button></aside></div><section class="inventory" aria-labelledby="inventory-title"><h2 id="inventory-title">File inventory</h2><div class="table-wrap"><table><thead><tr><th>Path</th><th>Type</th><th>Records</th><th>Size</th></tr></thead><tbody>${inspection.files.map((f) => `<tr><td>${escape(f.path)}</td><td>${f.kind}</td><td>${f.records ?? '—'}</td><td>${bytes(f.bytes)}</td></tr>`).join('')}</tbody></table></div></section>`, demo ? 'Demo — Export Receipt' : 'Receipt — Export Receipt', 'Your archive at a glance');
  app.querySelector('[data-reset]')?.addEventListener('click', enterDemo);
  app.querySelector('[data-real]')?.addEventListener('click', () => { demo = false; inspection = null; route('/'); });
  app.querySelector('[data-json]')?.addEventListener('click', () => download('export-receipt.json', JSON.stringify(receiptData(inspection!), null, 2), 'application/json'));
  app.querySelector('[data-html]')?.addEventListener('click', () => download('export-receipt.html', receiptHtml(inspection!), 'text/html'));
  app.querySelector('[data-another]')?.addEventListener('click', () => { inspection = null; render(); });
}

function info(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  shell(`<article class="legal"><p class="kicker">${privacy ? 'LOCAL BY DEFAULT' : 'PLAIN TERMS'}</p><h1>${privacy ? 'Your archive stays on your device' : 'Use Export Receipt at your own pace'}</h1>${privacy ? '<p>Export Receipt reads files in your browser. It does not upload archives, use accounts, or run analytics.</p><h2>Storage</h2><p>Your color choice may be stored in this browser. Demo data is memory-only and disappears when you leave the demo.</p><h2>Questions</h2><p>Contact the Param Factory through its product listing.</p>' : '<p>Export Receipt is a free local inspection tool. It gives technical observations, not legal, security, or compliance advice.</p><h2>Your files</h2><p>You remain responsible for keeping your export and checking whether it meets your needs.</p><h2>No warranty</h2><p>The software is provided as-is under the MIT License.</p>'}</article>`, `${privacy ? 'Privacy' : 'Terms'} — Export Receipt`, privacy ? 'Your archive stays on your device' : 'Use Export Receipt at your own pace');
}

async function enterDemo() { demo = true; inspection = await sampleInspection(); route('/demo'); }
async function handleFile(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; const msg = app.querySelector<HTMLElement>('.error')!; msg.textContent = 'Inspecting this archive…'; try { inspection = await inspectFile(file); demo = false; route('/receipt'); } catch (error) { msg.textContent = error instanceof Error ? error.message : 'The export could not be inspected. Choose another file.'; } }
function download(name: string, content: string, type: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
function receiptHtml(data: Inspection) { const p = receiptData(data); return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Export Receipt — ${escape(data.name)}</title><style>body{font:16px system-ui;max-width:800px;margin:48px auto;padding:0 24px;color:#18211d}h1{font-size:2rem}li{margin:12px 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #18211d;padding:8px;text-align:left}</style><h1>Export Receipt</h1><p>Archive: ${escape(data.name)}</p><p>SHA-256: ${data.hash}</p><h2>Findings</h2><ul>${data.findings.map((f) => `<li><strong>${escape(f.title)}</strong> — ${escape(f.detail)}</li>`).join('')}</ul><h2>Retest checklist</h2><ol>${p.retestChecklist.map((x) => `<li>${escape(x)}</li>`).join('')}</ol></html>`; }
function render() { if (location.pathname === '/privacy') return info('privacy'); if (location.pathname === '/terms') return info('terms'); if (location.pathname === '/demo' && !inspection) { demo = true; landing(); void sampleInspection().then((result) => { inspection = result; report(); }); return; } if (location.pathname === '/demo' || location.pathname === '/receipt') return report(); landing(); }
render();
if ('serviceWorker' in navigator) window.addEventListener('load', async () => {
  const registration = await navigator.serviceWorker.register('/sw.js');
  registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) app.querySelector<HTMLElement>('#update-toast')!.hidden = false; }); });
});
