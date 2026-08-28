import { unzipSync, strFromU8 } from 'fflate';
import type { FileEntry, Finding, Inspection } from './types';

const DATE = /\b(20\d{2}[-/]\d{2}[-/]\d{2})(?:[T\s][0-2]\d:[0-5]\d(?::[0-5]\d)?(?:\.\d+)?(?:Z|[+-]\d\d:?\d\d)?)?\b/g;
const attachmentExtensions = /\.(jpg|jpeg|png|gif|webp|pdf|mp3|mp4|mov|wav|zip)$/i;
const decode = (data: Uint8Array) => new TextDecoder().decode(data.slice(0, 1_000_000));

export function classify(path: string): FileEntry['kind'] {
  if (/\.json$/i.test(path)) return 'JSON';
  if (/\.csv$/i.test(path)) return 'CSV';
  if (/\.(txt|md|html|xml)$/i.test(path)) return 'text';
  if (attachmentExtensions.test(path)) return 'attachment';
  return 'other';
}

export function datesIn(text: string): string[] {
  return [...new Set((text.match(DATE) || []).map((d) => d.slice(0, 10)))].sort();
}

export function countRecords(kind: FileEntry['kind'], text: string): number | undefined {
  try {
    if (kind === 'JSON') {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.length : Array.isArray(parsed.data) ? parsed.data.length : undefined;
    }
    if (kind === 'CSV') return Math.max(0, text.trim().split(/\r?\n/).length - 1);
  } catch { return undefined; }
  return undefined;
}

export function analyzeEntries(name: string, bytes: number, raw: Record<string, Uint8Array>, source: 'sample' | 'file', hash: string): Inspection {
  const files: FileEntry[] = [];
  const findings: Finding[] = [];
  for (const [path, data] of Object.entries(raw)) {
    const kind = classify(path);
    const text = ['JSON', 'CSV', 'text'].includes(kind) ? decode(data) : '';
    const recordCount = countRecords(kind, text);
    const entry: FileEntry = { path, bytes: data.byteLength, kind, records: recordCount, dates: datesIn(text) };
    files.push(entry);
    if ((kind === 'JSON' || kind === 'CSV') && recordCount === undefined) findings.push({ level: 'danger', title: `Unreadable ${kind}: ${path}`, detail: 'This file could not be parsed. Export it again or keep the original archive with this receipt.' });
    if (path.split('/').some((part) => part === '..' || part === '')) findings.push({ level: 'danger', title: `Unsafe path: ${path}`, detail: 'This archive contains a path that should not be extracted automatically.' });
  }
  const readable = files.filter((f) => f.kind === 'JSON' || f.kind === 'CSV');
  const attachments = files.filter((f) => f.kind === 'attachment');
  const allDates = files.flatMap((f) => f.dates || []).sort();
  if (!readable.length) findings.push({ level: 'warn', title: 'No readable data tables found', detail: 'The archive may use a format Export Receipt does not yet understand.' });
  if (!attachments.length) findings.push({ level: 'warn', title: 'No attachments found', detail: 'Check whether images, documents, or media should be included in this export.' });
  if (!allDates.length) findings.push({ level: 'warn', title: 'No dates found in readable files', detail: 'You cannot confirm date coverage from this archive yet.' });
  if (allDates.length) findings.push({ level: 'ok', title: `Date coverage: ${allDates[0]} to ${allDates.at(-1)}`, detail: `Found dates across ${new Set(allDates).size} calendar days in readable files.` });
  findings.unshift({ level: 'info', title: `${files.length} files inventoried`, detail: `${readable.length} readable JSON or CSV files; ${attachments.length} attachments.` });
  return { name, bytes, files: files.sort((a, b) => a.path.localeCompare(b.path)), findings, hash, inspectedAt: new Date().toISOString(), source };
}

export async function sha256(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export async function inspectFile(file: File): Promise<Inspection> {
  const buffer = await file.arrayBuffer();
  const hash = await sha256(buffer);
  const bytes = new Uint8Array(buffer);
  if (/\.zip$/i.test(file.name) || (bytes[0] === 0x50 && bytes[1] === 0x4b)) {
    try { return analyzeEntries(file.name, file.size, unzipSync(bytes), 'file', hash); }
    catch { throw new Error('This ZIP could not be read. It may be encrypted or damaged. Choose a standard ZIP export.'); }
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

export function receiptData(inspection: Inspection) {
  return { receiptVersion: 1, product: 'Export Receipt', ...inspection, retestChecklist: ['Keep the original export ZIP and this receipt together.', 'Compare the date range with the dates you expected.', 'Look at every warning before deleting your old account.', 'Request a fresh export if a needed category is absent or unreadable.'] };
}
