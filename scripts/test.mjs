import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const grepAt = args.indexOf('--grep');
if (grepAt !== -1) {
  const pattern = args[grepAt + 1];
  if (!pattern) throw new Error('Use --grep followed by a test name.');
  args.splice(grepAt, 2, '--testNamePattern', pattern);
}
const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);
