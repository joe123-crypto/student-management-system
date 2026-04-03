import process from 'node:process';

const input = await new Promise((resolve, reject) => {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    data += chunk;
  });
  process.stdin.on('end', () => resolve(data));
  process.stdin.on('error', reject);
});

const fullUrlCandidates = [];
const bareHostnameCandidates = [];
const fullUrlPattern = /https:\/\/[^\s`"'()<>]+/g;
const bareHostnamePattern = /(?<!https:\/\/)(?<!http:\/\/)\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.vercel\.app\b/gi;

for (const match of input.matchAll(fullUrlPattern)) {
  try {
    const parsed = new URL(match[0]);
    if (parsed.hostname.endsWith('.vercel.app')) {
      fullUrlCandidates.push(parsed.toString().replace(/\/$/, ''));
    }
  } catch {
    // Ignore invalid matches from surrounding CLI noise.
  }
}

for (const match of input.matchAll(bareHostnamePattern)) {
  bareHostnameCandidates.push(`https://${match[0]}`.replace(/\/$/, ''));
}

const candidates = fullUrlCandidates.length > 0 ? fullUrlCandidates : bareHostnameCandidates;

if (candidates.length === 0) {
  console.error('[extract-vercel-deployment-url] Could not find a Vercel deployment URL in CLI output.');
  process.exit(1);
}

process.stdout.write(`${candidates[candidates.length - 1]}\n`);
