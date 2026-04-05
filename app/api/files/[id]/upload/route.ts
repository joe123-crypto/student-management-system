import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { getPendingUploadConstraints, uploadPendingFile } from '@/lib/files/store';
import { getClientIp } from '@/lib/security/request';

type RouteContext = {
  params: Promise<{ id: string }>;
};

class PayloadTooLargeError extends Error {
  constructor() {
    super('Uploaded file exceeds the allowed size limit.');
    this.name = 'PayloadTooLargeError';
  }
}

async function readRequestBodyWithinLimit(request: Request, maxBytes: number): Promise<Uint8Array> {
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new PayloadTooLargeError();
  }

  if (!request.body) {
    return new Uint8Array();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      throw new PayloadTooLargeError();
    }

    chunks.push(value);
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const actor = {
      id: session.user.id,
      role: session.user.role,
      loginId: session.user.loginId,
    };
    const constraints = await getPendingUploadConstraints({
      fileId: id,
      actor,
    });
    const body = await readRequestBodyWithinLimit(request, constraints.maxSizeBytes);

    await uploadPendingFile({
      fileId: id,
      actor,
      body,
      mimeType: request.headers.get('content-type') || undefined,
      audit: {
        ip: getClientIp(request.headers) ?? undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload file.';
    const status =
      error instanceof PayloadTooLargeError ? 413 :
      message === 'Forbidden' ? 403 :
      message === 'File not found.' ? 404 :
      message === 'Unauthorized' ? 401 :
      400;
    return NextResponse.json({ error: message }, { status });
  }
}
