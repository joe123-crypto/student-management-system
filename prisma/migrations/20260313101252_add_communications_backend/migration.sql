-- CreateEnum
CREATE TYPE "PermissionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionRequest" (
    "id" TEXT NOT NULL,
    "inscriptionNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "status" "PermissionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "PermissionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

-- CreateIndex
CREATE INDEX "Announcement_authorUserId_idx" ON "Announcement"("authorUserId");

-- CreateIndex
CREATE INDEX "PermissionRequest_inscriptionNumber_idx" ON "PermissionRequest"("inscriptionNumber");

-- CreateIndex
CREATE INDEX "PermissionRequest_status_idx" ON "PermissionRequest"("status");

-- CreateIndex
CREATE INDEX "PermissionRequest_submittedAt_idx" ON "PermissionRequest"("submittedAt");

-- CreateIndex
CREATE INDEX "PermissionRequest_reviewedById_idx" ON "PermissionRequest"("reviewedById");

-- CreateIndex
CREATE INDEX "AuthUser_role_idx" ON "AuthUser"("role");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionRequest" ADD CONSTRAINT "PermissionRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
