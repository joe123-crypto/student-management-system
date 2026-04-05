import assert from 'node:assert/strict';
import test from 'node:test';
import { getClientIp } from '@/lib/security/request';

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

test('client ip is undefined when proxy headers are not explicitly trusted', () => {
  const originalTrustProxy = process.env.TRUST_PROXY_HEADERS;
  const originalTrustProvider = process.env.TRUST_PROXY_PROVIDER;
  delete process.env.TRUST_PROXY_HEADERS;
  delete process.env.TRUST_PROXY_PROVIDER;

  try {
    const ip = getClientIp({
      'x-forwarded-for': '203.0.113.10',
      'x-real-ip': '198.51.100.8',
    });

    assert.equal(ip, undefined);
  } finally {
    restoreEnv('TRUST_PROXY_HEADERS', originalTrustProxy);
    restoreEnv('TRUST_PROXY_PROVIDER', originalTrustProvider);
  }
});

test('client ip uses the first valid forwarded address when trusted proxy headers are enabled', () => {
  const originalTrustProxy = process.env.TRUST_PROXY_HEADERS;
  const originalTrustProvider = process.env.TRUST_PROXY_PROVIDER;
  process.env.TRUST_PROXY_HEADERS = 'true';
  process.env.TRUST_PROXY_PROVIDER = 'generic';

  try {
    const ip = getClientIp({
      'x-forwarded-for': 'unknown, 203.0.113.10:443, 198.51.100.8',
    });

    assert.equal(ip, '203.0.113.10');
  } finally {
    restoreEnv('TRUST_PROXY_HEADERS', originalTrustProxy);
    restoreEnv('TRUST_PROXY_PROVIDER', originalTrustProvider);
  }
});

test('cloudflare mode prefers cf-connecting-ip when present', () => {
  const originalTrustProxy = process.env.TRUST_PROXY_HEADERS;
  const originalTrustProvider = process.env.TRUST_PROXY_PROVIDER;
  process.env.TRUST_PROXY_HEADERS = 'true';
  process.env.TRUST_PROXY_PROVIDER = 'cloudflare';

  try {
    const ip = getClientIp({
      'cf-connecting-ip': '198.51.100.22',
      'x-forwarded-for': '203.0.113.10',
    });

    assert.equal(ip, '198.51.100.22');
  } finally {
    restoreEnv('TRUST_PROXY_HEADERS', originalTrustProxy);
    restoreEnv('TRUST_PROXY_PROVIDER', originalTrustProvider);
  }
});

test('invalid proxy header values are ignored', () => {
  const originalTrustProxy = process.env.TRUST_PROXY_HEADERS;
  const originalTrustProvider = process.env.TRUST_PROXY_PROVIDER;
  process.env.TRUST_PROXY_HEADERS = 'true';
  process.env.TRUST_PROXY_PROVIDER = 'vercel';

  try {
    const ip = getClientIp({
      'x-forwarded-for': 'garbage-value',
      'x-real-ip': 'also-not-an-ip',
    });

    assert.equal(ip, undefined);
  } finally {
    restoreEnv('TRUST_PROXY_HEADERS', originalTrustProxy);
    restoreEnv('TRUST_PROXY_PROVIDER', originalTrustProvider);
  }
});
