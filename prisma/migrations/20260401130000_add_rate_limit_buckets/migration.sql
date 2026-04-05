CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "scopeHash" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");
CREATE INDEX "RateLimitBucket_bucket_resetAt_idx" ON "RateLimitBucket"("bucket", "resetAt");
