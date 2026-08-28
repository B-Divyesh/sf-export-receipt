import { describe, expect, it } from 'vitest';
import { analyzeEntries, countCsvRecords, datesIn, MAX_ZIP_EXPANDED_BYTES, preflightZip, receiptPayload } from '../src/inspect';
import { zipSync } from 'fflate';

describe('archive inspection regressions', () => {
  it('parses a complete JSON export above one megabyte instead of truncating it', () => {
    const rows = Array.from({ length: 30_000 }, (_, index) => ({ id: index, created_at: '2025-01-08', body: 'export record with enough text to exceed the old limit' }));
    const inspection = analyzeEntries('large.json', JSON.stringify(rows).length, { 'large.json': new TextEncoder().encode(JSON.stringify(rows)) }, 'file', 'abc');
    expect(inspection.files[0].records).toBe(30_000);
    expect(inspection.files[0].readable).toBe(true);
    expect(inspection.findings.some((finding) => finding.title.startsWith('Unreadable JSON'))).toBe(false);
  });

  it('counts quoted multiline CSV fields as one record and rejects unterminated quotes', () => {
    expect(countCsvRecords('name,note\nMara,"first line\nsecond line"\nKai,ready\n')).toBe(2);
    expect(countCsvRecords('name,note\nMara,"unfinished\n')).toBeUndefined();
  });

  it('only includes calendar-valid dates in coverage', () => {
    expect(datesIn('bad 2025-99-99 and leap 2024-02-29 and impossible 2025-02-29')).toEqual(['2024-02-29']);
  });

  it('counts only successfully parsed tables as readable', () => {
    const inspection = analyzeEntries('mixed.zip', 20, { 'valid.csv': new TextEncoder().encode('name\nMara\n'), 'broken.json': new TextEncoder().encode('{bad') }, 'file', 'abc');
    expect(inspection.files.filter((file) => file.readable)).toHaveLength(1);
    expect(inspection.findings[0].detail).toContain('1 successfully parsed');
  });

  it('uses a pluggable common-export inspector and reports an omitted category', () => {
    const inspection = analyzeEntries('harbor.zip', 20, { 'account/messages.json': new TextEncoder().encode('[]'), 'account/contacts.csv': new TextEncoder().encode('name\nMara\n'), 'media/a.jpg': new Uint8Array(1) }, 'file', 'abc');
    expect(inspection.inspector).toBe('Harbor Mail export');
    expect(inspection.categoryChecks.find((check) => check.id === 'profile')?.status).toBe('missing');
    expect(inspection.findings.some((finding) => finding.title === 'Missing category: Profile')).toBe(true);
  });

  it('rejects a ZIP whose central directory advertises a hostile expanded size before decompression', () => {
    const archive = zipSync({ 'small.txt': new TextEncoder().encode('ok') });
    const signature = [0x50, 0x4b, 0x01, 0x02];
    const offset = archive.findIndex((_, index) => signature.every((value, part) => archive[index + part] === value));
    new DataView(archive.buffer).setUint32(offset + 24, MAX_ZIP_EXPANDED_BYTES + 1, true);
    expect(() => preflightZip(archive)).toThrow('safe inspection limits');
  });

  it('keeps receipt payloads portable with category checks and a retest checklist', () => {
    const inspection = analyzeEntries('only.csv', 21, { 'only.csv': new TextEncoder().encode('name,created_at\nMara,2025-01-06\n') }, 'file', 'abc');
    const receipt = receiptPayload(inspection);
    expect(receipt.receiptVersion).toBe(2);
    expect(receipt.retestChecklist).toHaveLength(4);
    expect(JSON.parse(JSON.stringify(receipt)).files[0].records).toBe(1);
  });
});
