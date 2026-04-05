import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

type GlobalRateLimitCleanupState = {
  __appRateLimitLastCleanupAt?: number;
};

const globalForRateLimit = globalThis as typeof globalThis & GlobalRateLimitCleanupState;

function hashRateLimitScope(bucket: string, key: string): string {
  return createHash('sha256')
    .update(`${bucket}:${key}`)
    .digest('hex');
}

export function buildRateLimitBucketId(bucket: string, key: string): string {
  return `${bucket}:${hashRateLimitScope(bucket, key)}`;
}

export function toRateLimitDecision(params: {
  count: number;
  limit: number;
  resetAt: Date;
  nowMs: number;
}) {
  return {
    allowed: params.count <= params.limit,
    remaining: Math.max(params.limit - params.count, 0),
    retryAfterSeconds: Math.max(
      Math.ceil((params.resetAt.getTime() - params.nowMs) / 1000),
      1,
    ),
  };
}

async function maybeCleanupExpiredBuckets(nowMs: number): Promise<void> {
  const lastCleanupAt = globalForRateLimit.__appRateLimitLastCleanupAt ?? 0;
  if (nowMs - lastCleanupAt < RATE_LIMIT_CLEANUP_INTERVAL_MS) {
    return;
  }

  globalForRateLimit.__appRateLimitLastCleanupAt = nowMs;

  try {
    await prisma.$executeRaw(Prisma.sql`
      DELETE FROM "RateLimitBucket"
      WHERE "resetAt" <= ${new Date(nowMs)}
    `);
  } catch (error) {
    globalForRateLimit.__appRateLimitLastCleanupAt = lastCleanupAt;
    console.warn('[RATE_LIMIT] Failed to clean up expired buckets:', error);
  }
}

export async function takeRateLimitToken(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  const nowMs = Date.now();
  const nextResetAt = new Date(nowMs + params.windowMs);
  const scopeHash = hashRateLimitScope(params.bucket, params.key);
  const bucketId = buildRateLimitBucketId(params.bucket, params.key);

  const [row] = await prisma.$queryRaw<Array<{ count: number | bigint; resetAt: Date }>>(Prisma.sql`
    INSERT INTO "RateLimitBucket" (
      "id",
      "bucket",
      "scopeHash",
      "count",
      "resetAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${bucketId},
      ${params.bucket},
      ${scopeHash},
      1,
      ${nextResetAt},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("id") DO UPDATE
    SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= CURRENT_TIMESTAMP THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= CURRENT_TIMESTAMP THEN ${nextResetAt}
        ELSE "RateLimitBucket"."resetAt"
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "count", "resetAt"
  `);

  if (!row) {
    throw new Error('Failed to acquire a rate limit token.');
  }

  void maybeCleanupExpiredBuckets(nowMs);

  return toRateLimitDecision({
    count: typeof row.count === 'bigint' ? Number(row.count) : row.count,
    limit: params.limit,
    resetAt: row.resetAt,
    nowMs,
  });
}
