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

async function bodyToUint8Array(body: unknown): Promise<Uint8Array> {
  if (!body) {
    return new Uint8Array();
  }

  if (typeof body === 'object' && 'transformToByteArray' in body) {
    const transformToByteArray = (body as { transformToByteArray?: () => Promise<Uint8Array> })
      .transformToByteArray;
    if (typeof transformToByteArray === 'function') {
      return new Uint8Array(await transformToByteArray.call(body));
    }
  }

  if (body instanceof Uint8Array) {
    return body;
  }

  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
    return new Uint8Array(body);
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return new Uint8Array(await body.arrayBuffer());
  }

  if (typeof body === 'object' && body && Symbol.asyncIterator in body) {
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    for await (const chunk of body as AsyncIterable<Uint8Array | Buffer | string>) {
      const nextChunk =
        typeof chunk === 'string'
          ? new TextEncoder().encode(chunk)
          : chunk instanceof Uint8Array
            ? chunk
            : new Uint8Array(chunk);

      totalBytes += nextChunk.byteLength;
      chunks.push(nextChunk);
    }

    const merged = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return merged;
  }

  throw new Error('Unsupported storage object body type.');
}

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

  async getObjectBytes(objectKey: string, maxBytes: number): Promise<Uint8Array | null> {
    if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
      return new Uint8Array();
    }

    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: objectKey,
          Range: `bytes=0-${Math.max(Math.floor(maxBytes) - 1, 0)}`,
        }),
      );

      return bodyToUint8Array(result.Body);
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
