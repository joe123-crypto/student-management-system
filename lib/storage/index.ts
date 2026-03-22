import { StorageProvider } from '@prisma/client';
import { R2StorageProvider } from '@/lib/storage/r2-provider';
import type { ObjectStorageProvider } from '@/lib/storage/provider';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function resolveRuntimeBucket(): string {
  const explicitBucket = process.env.OBJECT_STORAGE_BUCKET?.trim();
  if (explicitBucket) {
    return explicitBucket;
  }

  const vercelEnv = (process.env.VERCEL_ENV || '').trim().toLowerCase();
  if (vercelEnv === 'production') {
    return requireEnv('R2_BUCKET_PROD');
  }
  if (vercelEnv === 'preview') {
    return requireEnv('R2_BUCKET_PREVIEW');
  }

  return requireEnv('R2_BUCKET_DEV');
}

function resolveProviderName(): StorageProvider {
  const provider = (process.env.OBJECT_STORAGE_PROVIDER || 'r2').trim().toLowerCase();
  return provider === 's3' ? StorageProvider.S3 : StorageProvider.R2;
}

let providerInstance: ObjectStorageProvider | null = null;

export function getObjectStorageProvider(): ObjectStorageProvider {
  if (providerInstance) {
    return providerInstance;
  }

  const provider = resolveProviderName();
  if (provider !== StorageProvider.R2) {
    throw new Error(`Unsupported object storage provider: ${provider}`);
  }

  providerInstance = new R2StorageProvider({
    accountId: requireEnv('R2_ACCOUNT_ID'),
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    endpoint: process.env.R2_S3_API_URL?.trim(),
    bucket: resolveRuntimeBucket(),
  });

  return providerInstance;
}

export function getObjectStorageBucket(): string {
  return resolveRuntimeBucket();
}

export function getSignedUrlTtlSeconds(): number {
  const raw = Number(process.env.OBJECT_STORAGE_SIGNED_URL_TTL_SECONDS || 300);
  return Number.isFinite(raw) && raw > 0 ? raw : 300;
}
