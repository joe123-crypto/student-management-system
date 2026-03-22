import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ObjectStorageProvider, SignedUploadPayload } from '@/lib/storage/provider';

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint?: string;
};

function resolveEndpoint(config: R2Config): string {
  return config.endpoint?.trim() || `https://${config.accountId}.r2.cloudflarestorage.com`;
}

export class R2StorageProvider implements ObjectStorageProvider {
  private readonly client: S3Client;

  constructor(private readonly config: R2Config) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: resolveEndpoint(config),
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async createSignedUpload(input: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<SignedUploadPayload> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: input.objectKey,
      ContentType: input.mimeType,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn: 300 });
    return {
      method: 'PUT',
      url,
      headers: {
        'Content-Type': input.mimeType,
      },
    };
  }

  async putObject(input: {
    objectKey: string;
    body: Uint8Array;
    mimeType: string;
    sizeBytes: number;
  }): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: input.objectKey,
        Body: input.body,
        ContentType: input.mimeType,
        ContentLength: input.sizeBytes,
      }),
    );
  }

  async headObject(objectKey: string): Promise<{ sizeBytes: number; etag?: string } | null> {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: objectKey,
        }),
      );

      return {
        sizeBytes: Number(result.ContentLength || 0),
        etag: result.ETag?.replaceAll('"', ''),
      };
    } catch (error) {
      const name = typeof error === 'object' && error ? (error as { name?: string }).name : undefined;
      if (name === 'NotFound' || name === 'NoSuchKey') {
        return null;
      }

      throw error;
    }
  }

  async createSignedDownload(input: {
    objectKey: string;
    filename?: string;
    expiresInSeconds: number;
    disposition?: 'inline' | 'attachment';
    mimeType?: string;
  }): Promise<{ url: string; expiresAt: Date }> {
    const filename = (input.filename || 'download').replace(/["\\]/g, '_');
    const disposition = input.disposition || 'attachment';
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: input.objectKey,
      ResponseContentDisposition: `${disposition}; filename="${filename}"`,
      ResponseContentType: input.mimeType,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn: input.expiresInSeconds });

    return {
      url,
      expiresAt: new Date(Date.now() + input.expiresInSeconds * 1000),
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: objectKey,
      }),
    );
  }
}
