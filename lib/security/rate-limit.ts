type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type GlobalRateLimitStore = {
  __appRateLimitStore?: Map<string, RateLimitEntry>;
};

const globalForRateLimit = globalThis as typeof globalThis & GlobalRateLimitStore;

function getStore() {
  if (!globalForRateLimit.__appRateLimitStore) {
    globalForRateLimit.__appRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalForRateLimit.__appRateLimitStore;
}

function cleanupExpiredEntries(store: Map<string, RateLimitEntry>, now: number) {
  if (store.size < 500) {
    return;
  }

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function takeRateLimitToken(params: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const store = getStore();
  const compositeKey = `${params.bucket}:${params.key}`;
  const current = store.get(compositeKey);
  const entry =
    current && current.resetAt > now
      ? current
      : {
          count: 0,
          resetAt: now + params.windowMs,
        };

  entry.count += 1;
  store.set(compositeKey, entry);
  cleanupExpiredEntries(store, now);

  return {
    allowed: entry.count <= params.limit,
    remaining: Math.max(params.limit - entry.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((entry.resetAt - now) / 1000), 1),
  };
}
