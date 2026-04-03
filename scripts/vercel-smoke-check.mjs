import { spawnSync } from 'node:child_process';

const [baseUrl, token] = process.argv.slice(2);

if (!baseUrl || !token) {
  console.error('Usage: node scripts/vercel-smoke-check.mjs <deployment-url> <vercel-token>');
  process.exit(1);
}

const checks = [
  {
    path: '/',
    description: 'public home page',
    markers: ['The Central support platform for students in Algeria', 'See how ScholarsAlger works in under two minutes'],
  },
  {
    path: '/login',
    description: 'public login page',
    markers: ['Sign in to access your ScholarsAlger account.', 'Request permission'],
  },
  {
    path: '/request-permission',
    description: 'public permission request page',
    markers: ['Send your details to the student attache for account approval.', 'Send request'],
  },
];

for (const check of checks) {
  const result = spawnSync(
    'vercel',
    ['curl', check.path, '--deployment', baseUrl, '--token', token],
    {
      encoding: 'utf8',
      shell: false,
    },
  );

  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const combinedOutput = `${stdout}\n${stderr}`;

  if (result.status !== 0) {
    console.error(`[smoke-check] Request failed for ${check.path} (${check.description}).`);
    process.stderr.write(combinedOutput);
    process.exit(result.status ?? 1);
  }

  const hasExpectedMarker = check.markers.some((marker) => stdout.includes(marker));

  if (!hasExpectedMarker) {
    console.error(
      `[smoke-check] Unexpected content for ${check.path}. None of the expected markers were found.`,
    );
    process.stderr.write(`${stdout.slice(0, 4000)}\n${stderr}`);
    process.exit(1);
  }

  console.log(`[smoke-check] ${check.path} ok (${check.description})`);
}
