import { randomUUID, timingSafeEqual } from 'crypto';
import { FilePurpose } from '@prisma/client';
import { NextResponse } from 'next/server';
import { buildFileObjectKey } from '@/lib/files/object-key';
import { getObjectStorageProvider } from '@/lib/storage';

const STORAGE_SMOKE_FILENAME = 'ci-storage-smoke.png';
const STORAGE_SMOKE_MIME_TYPE = 'image/png';
const STORAGE_SMOKE_STUDENT_ID = 999999;
const STORAGE_SMOKE_PNG_BYTES = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn8n9QAAAAASUVORK5CYII=',
    'base64',
  ),
);

function isAuthorized(request: Request): boolean {
  const configuredToken = process.env.STORAGE_SMOKE_TOKEN?.trim();
  const providedToken = request.headers.get('x-storage-smoke-token')?.trim();

  if (!configuredToken || !providedToken) {
    return false;
  }

  const expected = Buffer.from(configuredToken);
  const actual = Buffer.from(providedToken);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const provider = getObjectStorageProvider();
  const fileId = randomUUID();
  const objectKey = buildFileObjectKey({
    purpose: FilePurpose.PROFILE_IMAGE,
    studentId: STORAGE_SMOKE_STUDENT_ID,
    fileId,
    filename: STORAGE_SMOKE_FILENAME,
  });

  let uploaded = false;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      corsOrigin?: unknown;
    };
    const corsOrigin =
      typeof body.corsOrigin === 'string' && body.corsOrigin.trim()
        ? body.corsOrigin.trim()
        : new URL(request.url).origin;

    const upload = await provider.createSignedUpload({
      objectKey,
      mimeType: STORAGE_SMOKE_MIME_TYPE,
      sizeBytes: STORAGE_SMOKE_PNG_BYTES.byteLength,
    });

    const corsResponse = await fetch(upload.url, {
      method: 'OPTIONS',
      headers: {
        Origin: corsOrigin,
        'Access-Control-Request-Method': upload.method,
        'Access-Control-Request-Headers': 'content-type',
      },
    });

    const allowOrigin = corsResponse.headers.get('access-control-allow-origin');
    const allowMethods = corsResponse.headers.get('access-control-allow-methods');
    const allowHeaders = corsResponse.headers.get('access-control-allow-headers');

    const allowsOrigin = allowOrigin === '*' || allowOrigin === corsOrigin;
    const allowsPut = allowMethods?.toUpperCase().includes(upload.method) ?? false;
    const allowsContentType =
      allowHeaders?.toLowerCase().includes('content-type') ||
      allowHeaders === '*';

    if (!allowOrigin || !allowMethods || !allowHeaders || !allowsOrigin || !allowsPut || !allowsContentType) {
      throw new Error(
        `R2 CORS preflight does not allow ${corsOrigin} to upload with Content-Type.`,
      );
    }

    const uploadHeaders = new Headers(upload.headers);
    const putResponse = await fetch(upload.url, {
      method: upload.method,
      headers: uploadHeaders,
      body: STORAGE_SMOKE_PNG_BYTES,
    });

    if (!putResponse.ok) {
      throw new Error(`Signed upload failed with status ${putResponse.status}.`);
    }

    uploaded = true;

    const head = await provider.headObject(objectKey);

    if (!head) {
      throw new Error('Uploaded smoke-test object was not found in R2.');
    }

    if (head.sizeBytes !== STORAGE_SMOKE_PNG_BYTES.byteLength) {
      throw new Error(
        `Uploaded smoke-test object has unexpected size ${head.sizeBytes}.`,
      );
    }

    await provider.deleteObject(objectKey);
    uploaded = false;

    return NextResponse.json({
      ok: true,
      probe: {
        objectKey,
        bytesUploaded: STORAGE_SMOKE_PNG_BYTES.byteLength,
        cors: {
          originTested: corsOrigin,
          preflightStatus: corsResponse.status,
          allowOrigin,
          allowMethods,
          allowHeaders,
        },
        upload: {
          method: upload.method,
          putStatus: putResponse.status,
        },
        head,
        deleted: true,
      },
    });
  } catch (error) {
    if (uploaded) {
      await provider.deleteObject(objectKey).catch(() => undefined);
    }

    const message =
      error instanceof Error ? error.message : 'Storage smoke test failed unexpectedly.';

    return NextResponse.json({ ok: false, error: message, objectKey }, { status: 500 });
  }
}
