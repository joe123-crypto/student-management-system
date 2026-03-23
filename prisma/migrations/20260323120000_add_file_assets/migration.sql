CREATE TYPE "FilePurpose" AS ENUM ('PROFILE_IMAGE', 'RESULT_SLIP');
CREATE TYPE "FileStatus" AS ENUM ('PENDING_UPLOAD', 'ACTIVE', 'QUARANTINED', 'DELETED');
CREATE TYPE "FileVisibility" AS ENUM ('PRIVATE');
CREATE TYPE "StorageProvider" AS ENUM ('R2', 'S3');

CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "purpose" "FilePurpose" NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "visibility" "FileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "provider" "StorageProvider" NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "sanitizedFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "etag" TEXT,
    "studentId" INTEGER,
    "personId" INTEGER,
    "enrollmentId" INTEGER,
    "progressId" INTEGER,
    "uploadedByUserId" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "supersededById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FileAsset_objectKey_key" ON "FileAsset"("objectKey");
CREATE INDEX "FileAsset_purpose_status_createdAt_idx" ON "FileAsset"("purpose", "status", "createdAt");
CREATE INDEX "FileAsset_studentId_purpose_status_createdAt_idx" ON "FileAsset"("studentId", "purpose", "status", "createdAt");
CREATE INDEX "FileAsset_progressId_purpose_status_createdAt_idx" ON "FileAsset"("progressId", "purpose", "status", "createdAt");
CREATE INDEX "FileAsset_uploadedByUserId_createdAt_idx" ON "FileAsset"("uploadedByUserId", "createdAt");

ALTER TABLE "FileAsset"
  ADD CONSTRAINT "FileAsset_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "STUDENT"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FileAsset"
  ADD CONSTRAINT "FileAsset_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "PERSON"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FileAsset"
  ADD CONSTRAINT "FileAsset_enrollmentId_fkey"
  FOREIGN KEY ("enrollmentId") REFERENCES "ENROLLMENT"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FileAsset"
  ADD CONSTRAINT "FileAsset_progressId_fkey"
  FOREIGN KEY ("progressId") REFERENCES "PROGRESS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FileAsset"
  ADD CONSTRAINT "FileAsset_uploadedByUserId_fkey"
  FOREIGN KEY ("uploadedByUserId") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FileAsset"
  ADD CONSTRAINT "FileAsset_supersededById_fkey"
  FOREIGN KEY ("supersededById") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
