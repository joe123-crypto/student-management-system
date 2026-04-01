import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRateLimitBucketId, toRateLimitDecision } from '@/lib/security/rate-limit';

test('rate limit bucket ids are deterministic and do not expose the raw key', () => {
  const id = buildRateLimitBucketId('signin', '203.0.113.10');

  assert.equal(id, buildRateLimitBucketId('signin', '203.0.113.10'));
  assert.notEqual(id, buildRateLimitBucketId('signin', '203.0.113.11'));
  assert.equal(id.includes('203.0.113.10'), false);
  assert.equal(id.startsWith('signin:'), true);
});

test('rate limit decision calculates allowance, remaining tokens, and retry-after', () => {
  const nowMs = Date.UTC(2026, 3, 1, 12, 0, 0);
  const decision = toRateLimitDecision({
    count: 4,
    limit: 3,
    resetAt: new Date(nowMs + 4_500),
    nowMs,
  });

  assert.deepEqual(decision, {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: 5,
  });
});
