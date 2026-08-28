import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const grepAt = args.indexOf('--grep');
const pattern = grepAt === -1 ? undefined : args[grepAt + 1];
if (grepAt !== -1 && !pattern) throw new Error('Use --grep followed by a test name.');

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!pattern || !pattern.includes('@claim:')) {
  const vitestArgs = ['node_modules/vitest/vitest.mjs', 'run'];
  if (pattern) vitestArgs.push('--testNamePattern', pattern);
  run(process.execPath, vitestArgs);
}
run(process.execPath, ['scripts/browser-tests.mjs', ...(pattern ? ['--grep', pattern] : [])]);
