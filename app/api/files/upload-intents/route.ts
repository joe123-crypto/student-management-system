import { FilePurpose } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { createUploadIntent } from '@/lib/files/store';
import { getClientIp } from '@/lib/security/request';

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      purpose?: unknown;
      filename?: unknown;
      mimeType?: unknown;
      sizeBytes?: unknown;
      studentProfileId?: unknown;
      studentId?: unknown;
    };

    const purpose =
      typeof body.purpose === 'string' && body.purpose in FilePurpose
        ? (body.purpose as FilePurpose)
        : null;

    if (!purpose) {
      return NextResponse.json({ error: 'Invalid file purpose.' }, { status: 400 });
    }

    const result = await createUploadIntent({
      actor: {
        id: session.user.id,
        role: session.user.role,
        loginId: session.user.loginId,
      },
      purpose,
      filename: typeof body.filename === 'string' ? body.filename : '',
      mimeType: typeof body.mimeType === 'string' ? body.mimeType : '',
      sizeBytes: typeof body.sizeBytes === 'number' ? body.sizeBytes : Number(body.sizeBytes),
      studentProfileId:
        typeof body.studentProfileId === 'string' ? body.studentProfileId : undefined,
      studentId: typeof body.studentId === 'number' ? body.studentId : undefined,
      audit: {
        ip: getClientIp(request.headers) ?? undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create upload intent.';
    const status =
      message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
