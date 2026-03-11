-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ATTACHE');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('student_inscription', 'attache_email');

-- CreateEnum
CREATE TYPE "StudentProfileStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "AuthUser" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "loginId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "authProvider" "AuthProvider" NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedSignInCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfileRecord" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT,
    "inscriptionNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "status" "StudentProfileStatus" NOT NULL DEFAULT 'PENDING',
    "profile" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfileRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_role_loginId_key" ON "AuthUser"("role", "loginId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfileRecord_authUserId_key" ON "StudentProfileRecord"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfileRecord_inscriptionNumber_key" ON "StudentProfileRecord"("inscriptionNumber");

-- CreateIndex
CREATE INDEX "StudentProfileRecord_status_idx" ON "StudentProfileRecord"("status");

-- CreateIndex
CREATE INDEX "StudentProfileRecord_fullName_idx" ON "StudentProfileRecord"("fullName");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfileRecord" ADD CONSTRAINT "StudentProfileRecord_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
