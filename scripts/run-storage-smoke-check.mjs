const smokeUrl = process.env.STORAGE_SMOKE_URL?.trim();
const smokeToken = process.env.STORAGE_SMOKE_TOKEN?.trim();
const corsOrigin = process.env.STORAGE_SMOKE_CORS_ORIGIN?.trim();

if (!smokeUrl) {
  console.error('Missing required env var: STORAGE_SMOKE_URL');
  process.exit(1);
}

if (!smokeToken) {
  console.error('Missing required env var: STORAGE_SMOKE_TOKEN');
  process.exit(1);
}

const response = await fetch(smokeUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-storage-smoke-token': smokeToken,
  },
  body: JSON.stringify({
    corsOrigin,
  }),
});

const payload = await response.json().catch(() => null);

if (!response.ok || !payload?.ok) {
  console.error('Storage smoke check failed.');
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log('Storage smoke check passed.');
console.log(JSON.stringify(payload, null, 2));
