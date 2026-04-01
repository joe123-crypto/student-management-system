export type SignedUploadPayload = {
  method: 'PUT' | 'POST';
  url: string;
  headers?: Record<string, string>;
  fields?: Record<string, string>;
};

export interface ObjectStorageProvider {
  createSignedUpload(input: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<SignedUploadPayload>;
  putObject(input: {
    objectKey: string;
    body: Uint8Array;
    mimeType: string;
    sizeBytes: number;
  }): Promise<void>;
  headObject(objectKey: string): Promise<{
    sizeBytes: number;
    etag?: string;
  } | null>;
  getObjectBytes(objectKey: string, maxBytes: number): Promise<Uint8Array | null>;
  createSignedDownload(input: {
    objectKey: string;
    filename?: string;
    expiresInSeconds: number;
    disposition?: 'inline' | 'attachment';
    mimeType?: string;
  }): Promise<{
    url: string;
    expiresAt: Date;
  }>;
  deleteObject(objectKey: string): Promise<void>;
}
