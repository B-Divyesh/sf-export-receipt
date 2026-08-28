import { describe, expect, it, vi } from 'vitest';
import { analyzeEntries, receiptData, sampleInspection } from '../src/inspect';

describe('archive inspection', () => {
  it('@claim:sample-inventory inventories dates, readable files, and attachments in the demo archive', async () => {
    const result = await sampleInspection();
    expect(result.files).toHaveLength(4);
    expect(result.files.filter((file) => ['JSON', 'CSV'].includes(file.kind))).toHaveLength(2);
    expect(result.findings.some((finding) => finding.title.includes('2022-02-19 to 2025-01-08'))).toBe(true);
    expect(result.findings.some((finding) => finding.title === 'No attachments found')).toBe(false);
  });

  it('@claim:local-only inspects supplied bytes without network access', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    await sampleInspection();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('@claim:json-receipt makes a portable receipt with a retest checklist', () => {
    const inspection = analyzeEntries('only.csv', 21, { 'only.csv': new TextEncoder().encode('name,created_at\nMara,2025-01-06\n') }, 'file', 'abc');
    const receipt = receiptData(inspection);
    expect(receipt.receiptVersion).toBe(1);
    expect(receipt.retestChecklist).toHaveLength(4);
    expect(JSON.parse(JSON.stringify(receipt)).files[0].records).toBe(1);
  });

  it('@claim:offline-reload ships an offline app shell and fallback', async () => {
    const sw = await (await import('node:fs/promises')).readFile('public/sw.js', 'utf8');
    expect(sw).toContain("'/index.html'");
    expect(sw).toContain("'/offline.html'");
  });

  it('flags malformed JSON and unsafe paths', () => {
    const inspection = analyzeEntries('broken.zip', 12, { '../broken.json': new TextEncoder().encode('{bad') }, 'file', 'abc');
    expect(inspection.findings.filter((finding) => finding.level === 'danger')).toHaveLength(2);
  });
});
