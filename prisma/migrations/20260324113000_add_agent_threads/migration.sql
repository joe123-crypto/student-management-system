CREATE TYPE "AgentThreadChannel" AS ENUM ('WEB');
CREATE TYPE "AgentMessageAuthor" AS ENUM ('USER', 'ASSISTANT');

CREATE TABLE "AgentThread" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "channel" "AgentThreadChannel" NOT NULL DEFAULT 'WEB',
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "author" "AgentMessageAuthor" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AgentThread_ownerUserId_updatedAt_idx" ON "AgentThread"("ownerUserId", "updatedAt");
CREATE INDEX "AgentMessage_threadId_createdAt_idx" ON "AgentMessage"("threadId", "createdAt");

ALTER TABLE "AgentThread"
  ADD CONSTRAINT "AgentThread_ownerUserId_fkey"
  FOREIGN KEY ("ownerUserId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentMessage"
  ADD CONSTRAINT "AgentMessage_threadId_fkey"
  FOREIGN KEY ("threadId") REFERENCES "AgentThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
