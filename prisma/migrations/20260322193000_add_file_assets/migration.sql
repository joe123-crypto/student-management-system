-- CreateEnum
CREATE TYPE "FilePurpose" AS ENUM ('PROFILE_IMAGE', 'RESULT_SLIP', 'ATTACHE_ATTACHMENT', 'AGENT_CONTEXT');

-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('PRIVATE', 'INTERNAL');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING_UPLOAD', 'ACTIVE', 'QUARANTINED', 'DELETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('R2', 'S3');

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "purpose" "FilePurpose" NOT NULL,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "FileStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "provider" "StorageProvider" NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "sanitizedFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "etag" TEXT,
    "studentId" INTEGER,
    "personId" INTEGER,
    "enrollmentId" INTEGER,
    "progressId" INTEGER,
    "uploadedByUserId" TEXT,
    "supersededById" TEXT,
    "scanStatus" TEXT,
    "scanDetails" JSONB,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentContextFile" (
    "id" TEXT NOT NULL,
    "fileAssetId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "sessionId" TEXT,
    "source" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentContextFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileAsset_objectKey_key" ON "FileAsset"("objectKey");

-- CreateIndex
CREATE INDEX "FileAsset_purpose_status_idx" ON "FileAsset"("purpose", "status");

-- CreateIndex
CREATE INDEX "FileAsset_studentId_purpose_idx" ON "FileAsset"("studentId", "purpose");

-- CreateIndex
CREATE INDEX "FileAsset_personId_purpose_idx" ON "FileAsset"("personId", "purpose");

-- CreateIndex
CREATE INDEX "FileAsset_enrollmentId_purpose_idx" ON "FileAsset"("enrollmentId", "purpose");

-- CreateIndex
CREATE INDEX "FileAsset_progressId_purpose_idx" ON "FileAsset"("progressId", "purpose");

-- CreateIndex
CREATE INDEX "FileAsset_uploadedByUserId_createdAt_idx" ON "FileAsset"("uploadedByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "FileAsset_expiresAt_idx" ON "FileAsset"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentContextFile_fileAssetId_key" ON "AgentContextFile"("fileAssetId");

-- CreateIndex
CREATE INDEX "AgentContextFile_ownerUserId_createdAt_idx" ON "AgentContextFile"("ownerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentContextFile_sessionId_idx" ON "AgentContextFile"("sessionId");

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "STUDENT"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PERSON"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ENROLLMENT"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "PROGRESS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentContextFile" ADD CONSTRAINT "AgentContextFile_fileAssetId_fkey" FOREIGN KEY ("fileAssetId") REFERENCES "FileAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentContextFile" ADD CONSTRAINT "AgentContextFile_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
