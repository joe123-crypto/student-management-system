import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let objectStorageClient: S3Client | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required object-storage env var: ${name}`);
  }

  return value;
}

function getObjectStorageClient(): S3Client {
  if (!objectStorageClient) {
    objectStorageClient = new S3Client({
      region: 'auto',
      endpoint: getRequiredEnv('R2_S3_API_URL'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
        secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  return objectStorageClient;
}

export async function createSignedDownloadUrl({
  bucket,
  objectKey,
  responseContentType,
}: {
  bucket: string;
  objectKey: string;
  responseContentType?: string | null;
}): Promise<string> {
  const ttlSeconds = Number(process.env.OBJECT_STORAGE_SIGNED_URL_TTL_SECONDS || '300');

  return getSignedUrl(
    getObjectStorageClient(),
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ResponseContentType: responseContentType || undefined,
    }),
    {
      expiresIn: Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : 300,
    },
  );
}
