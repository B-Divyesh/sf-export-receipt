export type FindingLevel = 'ok' | 'warn' | 'danger' | 'info';

export interface Finding { level: FindingLevel; title: string; detail: string }
export interface FileEntry {
  path: string;
  bytes: number;
  kind: 'JSON' | 'CSV' | 'text' | 'attachment' | 'other';
  records?: number;
  dates?: string[];
}
export interface Inspection {
  name: string;
  bytes: number;
  files: FileEntry[];
  findings: Finding[];
  hash: string;
  inspectedAt: string;
  source: 'sample' | 'file';
}
