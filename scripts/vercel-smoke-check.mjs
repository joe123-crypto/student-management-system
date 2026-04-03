import { spawnSync } from 'node:child_process';

const [baseUrl, token] = process.argv.slice(2);

if (!baseUrl || !token) {
  console.error('Usage: node scripts/vercel-smoke-check.mjs <deployment-url> <vercel-token>');
  process.exit(1);
}

const checks = [
  { path: '/', expected: [200], description: 'public home page' },
  { path: '/login', expected: [200], description: 'public login page' },
  { path: '/request-permission', expected: [200], description: 'public permission request page' },
  { path: '/onboarding', expected: [301, 302, 303, 307, 308], description: 'protected onboarding redirect' },
  { path: '/attache', expected: [301, 302, 303, 307, 308], description: 'protected attache redirect' },
];

function extractStatusCodes(output) {
  const matches = [...output.matchAll(/< HTTP\/[0-9.]+\s+(\d{3})/g)];
  return matches.map((match) => Number(match[1]));
}

for (const check of checks) {
  const result = spawnSync(
    'vercel',
    ['curl', check.path, '--deployment', baseUrl, '--token', token, '-v'],
    {
      encoding: 'utf8',
      shell: false,
    },
  );

  const combinedOutput = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  const statusCodes = extractStatusCodes(combinedOutput);
  const finalStatus = statusCodes[statusCodes.length - 1];

  if (result.status !== 0) {
    console.error(`[smoke-check] Request failed for ${check.path} (${check.description}).`);
    process.stderr.write(combinedOutput);
    process.exit(result.status ?? 1);
  }

  if (!finalStatus || !check.expected.includes(finalStatus)) {
    console.error(
      `[smoke-check] Unexpected status for ${check.path}. Expected ${check.expected.join(' or ')}, got ${finalStatus ?? 'none'}.`,
    );
    process.stderr.write(combinedOutput);
    process.exit(1);
  }

  console.log(`[smoke-check] ${check.path} -> ${finalStatus} (${check.description})`);
}
