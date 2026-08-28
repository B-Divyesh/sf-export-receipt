import { unzipSync } from 'fflate';
import { analyzeEntries, preflightZip } from './inspect';

self.addEventListener('message', (event: MessageEvent<{ buffer: ArrayBuffer; name: string; bytes: number; hash: string }>) => {
  try {
    const archive = new Uint8Array(event.data.buffer);
    preflightZip(archive);
    const inspection = analyzeEntries(event.data.name, event.data.bytes, unzipSync(archive), 'file', event.data.hash);
    self.postMessage({ inspection });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'This ZIP could not be read. Choose a standard ZIP export.' });
  }
});
