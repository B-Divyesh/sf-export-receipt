import type { FileEntry, Finding, Inspection } from './types';
import { inspectCategories } from './inspectors';

const DATE = /\b(20\d{2}[-/]\d{2}[-/]\d{2})(?:[T\s][0-2]\d:[0-5]\d(?::[0-5]\d)?(?:\.\d+)?(?:Z|[+-]\d\d:?\d\d)?)?\b/g;
const attachmentExtensions = /\.(jpg|jpeg|png|gif|webp|pdf|mp3|mp4|mov|wav|zip)$/i;
export const MAX_SOURCE_BYTES = 50 * 1024 * 1024;
export const MAX_TEXT_BYTES = 20 * 1024 * 1024;
export const MAX_ZIP_ENTRIES = 1_000;
export const MAX_ZIP_EXPANDED_BYTES = 50 * 1024 * 1024;
export const MAX_ZIP_RATIO = 100;

export function classify(path: string): FileEntry['kind'] {
  if (/\.json$/i.test(path)) return 'JSON';
  if (/\.csv$/i.test(path)) return 'CSV';
  if (/\.(txt|md|html|xml)$/i.test(path)) return 'text';
  if (attachmentExtensions.test(path)) return 'attachment';
  return 'other';
}

function validDate(value: string): boolean {
  const [year, month, day] = value.split(/[-/]/).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function datesIn(text: string): string[] {
  return [...new Set((text.match(DATE) || []).map((date) => date.slice(0, 10)).filter(validDate))].sort();
}

/** RFC 4180-style record count. Newlines inside quoted fields are one record. */
export function countCsvRecords(text: string): number | undefined {
  if (!text.trim()) return 0;
  let rows = 0;
  let inQuotes = false;
  let hasContent = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') { index += 1; hasContent = true; continue; }
      inQuotes = !inQuotes;
      hasContent = true;
    } else if (char === '\n' && !inQuotes) {
      rows += 1;
      hasContent = false;
    } else if (char !== '\r') hasContent = true;
  }
  if (inQuotes) return undefined;
  if (hasContent) rows += 1;
  return Math.max(0, rows - 1);
}

export function countRecords(kind: FileEntry['kind'], text: string): number | undefined {
  try {
    if (kind === 'JSON') {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.length : Array.isArray(parsed.data) ? parsed.data.length : undefined;
    }
    if (kind === 'CSV') return countCsvRecords(text);
  } catch { return undefined; }
  return undefined;
}

function decode(data: Uint8Array): string | undefined {
  if (data.byteLength > MAX_TEXT_BYTES) return undefined;
  return new TextDecoder('utf-8', { fatal: false }).decode(data);
}

export function analyzeEntries(name: string, bytes: number, raw: Record<string, Uint8Array>, source: 'sample' | 'file', hash: string): Inspection {
  const files: FileEntry[] = [];
  const findings: Finding[] = [];
  for (const [path, data] of Object.entries(raw)) {
    const kind = classify(path);
    const text = ['JSON', 'CSV', 'text'].includes(kind) ? decode(data) : '';
    const recordCount = text === undefined ? undefined : countRecords(kind, text);
    const readable = (kind === 'JSON' || kind === 'CSV') && recordCount !== undefined;
    const entry: FileEntry = { path, bytes: data.byteLength, kind, records: recordCount, dates: text === undefined ? [] : datesIn(text), readable };
    files.push(entry);
    if ((kind === 'JSON' || kind === 'CSV') && text === undefined) findings.push({ level: 'danger', title: `Data file too large: ${path}`, detail: `This file is larger than the ${MAX_TEXT_BYTES / 1024 / 1024} MB safe parsing limit. Split or filter it, then inspect each part.` });
    else if ((kind === 'JSON' || kind === 'CSV') && recordCount === undefined) findings.push({ level: 'danger', title: `Unreadable ${kind}: ${path}`, detail: 'This file could not be parsed. Export it again or keep the original export with this receipt.' });
    if (path.split('/').some((part) => part === '..' || part === '')) findings.push({ level: 'danger', title: `Unsafe path: ${path}`, detail: 'This export contains a path that should not be extracted automatically.' });
  }
  const readable = files.filter((file) => file.readable);
  const attachments = files.filter((file) => file.kind === 'attachment');
  const allDates = readable.flatMap((file) => file.dates || []).sort();
  const categories = inspectCategories(files.map((file) => file.path));
  if (!readable.length) findings.push({ level: 'warn', title: 'No readable data tables found', detail: 'The export may use a format Export Receipt does not yet understand.' });
  if (!attachments.length) findings.push({ level: 'warn', title: 'No attachments found', detail: 'Check whether images, documents, or media should be included in this export.' });
  if (!allDates.length) findings.push({ level: 'warn', title: 'No valid dates found in readable files', detail: 'You cannot confirm date coverage from this export yet.' });
  if (allDates.length) findings.push({ level: 'ok', title: `Date coverage: ${allDates[0]} to ${allDates.at(-1)}`, detail: `Found dates across ${new Set(allDates).size} valid calendar days in readable files.` });
  if (categories.ambiguous) findings.push({ level: 'warn', title: 'Ambiguous export layout', detail: `This export matches ${categories.ambiguous.join(' and ')}. Check the categories manually before relying on a missing-category result.` });
  for (const category of categories.checks.filter((item) => item.status !== 'present')) findings.push({ level: 'warn', title: `Missing category: ${category.label}`, detail: category.detail });
  findings.unshift({ level: 'info', title: `${files.length} files inventoried`, detail: `${readable.length} successfully parsed JSON or CSV files; ${attachments.length} attachment${attachments.length === 1 ? '' : 's'}.` });
  return { name, bytes, files: files.sort((a, b) => a.path.localeCompare(b.path)), findings, hash, inspectedAt: new Date().toISOString(), source, inspector: categories.name, categoryChecks: categories.checks };
}

export interface ZipPreflight { entries: number; compressedBytes: number; expandedBytes: number }

/** Reads ZIP central-directory metadata before decompression, so bombs are rejected before allocation. */
export function preflightZip(bytes: Uint8Array): ZipPreflight {
  let entries = 0;
  let compressedBytes = 0;
  let expandedBytes = 0;
  for (let offset = 0; offset + 46 <= bytes.length; offset += 1) {
    if (new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true) !== 0x02014b50) continue;
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 46);
    const compressed = view.getUint32(20, true);
    const expanded = view.getUint32(24, true);
    const filenameLength = view.getUint16(28, true);
    const extraLength = view.getUint16(30, true);
    const commentLength = view.getUint16(32, true);
    entries += 1;
    compressedBytes += compressed;
    expandedBytes += expanded;
    if (entries > MAX_ZIP_ENTRIES || expandedBytes > MAX_ZIP_EXPANDED_BYTES || (compressedBytes > 0 && expandedBytes / compressedBytes > MAX_ZIP_RATIO)) throw new Error('This ZIP exceeds safe inspection limits. Choose an export with fewer than 1,000 files and less than 50 MB expanded data.');
    offset += 45 + filenameLength + extraLength + commentLength;
  }
  if (!entries) throw new Error('This ZIP has no readable central directory. Choose a standard, non-encrypted ZIP export.');
  return { entries, compressedBytes, expandedBytes };
}

export async function sha256(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, '0')).join('');
}

export async function inspectFile(file: File): Promise<Inspection> {
  if (file.size > MAX_SOURCE_BYTES) throw new Error('This export is larger than the 50 MB safe inspection limit. Split it into smaller exports before checking it.');
  const buffer = await file.arrayBuffer();
  const hash = await sha256(buffer);
  const bytes = new Uint8Array(buffer);
  if (/\.zip$/i.test(file.name) || (bytes[0] === 0x50 && bytes[1] === 0x4b)) {
    preflightZip(bytes);
    return new Promise<Inspection>((resolve, reject) => {
      const worker = new Worker(new URL('./inspect-worker.ts', import.meta.url), { type: 'module' });
      worker.addEventListener('message', (event: MessageEvent<{ inspection?: Inspection; error?: string }>) => {
        worker.terminate();
        if (event.data.error) reject(new Error(event.data.error)); else if (event.data.inspection) resolve(event.data.inspection); else reject(new Error('The ZIP inspection did not return a result.'));
      });
      worker.addEventListener('error', () => { worker.terminate(); reject(new Error('The ZIP could not be inspected. Choose a standard ZIP export.')); });
      worker.postMessage({ buffer, name: file.name, bytes: file.size, hash }, [buffer]);
    });
  }
  const kind = classify(file.name);
  if (!['JSON', 'CSV', 'text'].includes(kind)) throw new Error('Choose a ZIP, JSON, CSV, or text export. This file is not readable yet.');
  return analyzeEntries(file.name, file.size, { [file.name]: bytes }, 'file', hash);
}

export async function sampleInspection(): Promise<Inspection> {
  const messages = JSON.stringify([{ sent_at: '2023-05-14T09:10:00Z', body: 'Travel photo notes' }, { sent_at: '2024-11-30T17:21:00Z', body: 'Account export requested' }, { sent_at: '2025-01-08T12:00:00Z', body: 'Final message' }]);
  const contacts = 'name,email,created_at\nMara Singh,mara@example.test,2022-02-19\nKai Ivers,kai@example.test,2024-09-08\n';
  const raw = { 'account/messages.json': new TextEncoder().encode(messages), 'account/contacts.csv': new TextEncoder().encode(contacts), 'media/receipt-photo.jpg': new Uint8Array(812), 'README.txt': new TextEncoder().encode('Sample service export') };
  const stable = new TextEncoder().encode(messages + contacts).buffer;
  return analyzeEntries('harbor-mail-export.zip', 25_184, raw, 'sample', await sha256(stable));
}

export function receiptPayload(inspection: Inspection) {
  return { receiptVersion: 2, product: 'Export Receipt', ...inspection, retestChecklist: ['Keep the original export ZIP and this receipt together.', 'Compare the date range with the dates you expected.', 'Look at every warning before deleting your old account.', 'Request a fresh export if a needed category is absent or unreadable.'] };
}

const bytesToBase64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const base64UrlToBytes = (value: string) => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)), (char) => char.charCodeAt(0));

export async function receiptData(inspection: Inspection) {
  const payload = receiptPayload(inspection);
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const canonical = JSON.stringify(payload);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, new TextEncoder().encode(canonical));
  return { ...payload, signature: { version: 1, signer: 'Export Receipt local browser', algorithm: 'ECDSA P-256 SHA-256', signedAt: new Date().toISOString(), publicKeyJwk: await crypto.subtle.exportKey('jwk', pair.publicKey), value: bytesToBase64Url(new Uint8Array(signature)) } };
}

export async function verifyReceipt(receipt: Awaited<ReturnType<typeof receiptData>>): Promise<boolean> {
  const { signature, ...payload } = receipt;
  const key = await crypto.subtle.importKey('jwk', signature.publicKeyJwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
  return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, base64UrlToBytes(signature.value), new TextEncoder().encode(JSON.stringify(payload)));
}
