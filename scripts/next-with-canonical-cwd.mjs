import { realpathSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const repoRoot = realpathSync.native(process.cwd());
const [, , command = 'dev', ...restArgs] = process.argv;

const nextBin = path.join(repoRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const env = {
  ...process.env,
  INIT_CWD: repoRoot,
  PWD: repoRoot,
};

const child = spawn(process.execPath, [nextBin, command, ...restArgs], {
  cwd: repoRoot,
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error('[next-with-canonical-cwd] Failed to start Next.js:', error);
  process.exit(1);
});
