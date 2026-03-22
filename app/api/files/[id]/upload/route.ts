import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { uploadPendingFile } from '@/lib/files/store';
import { getClientIp } from '@/lib/security/request';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const buffer = await request.arrayBuffer();
    const body = new Uint8Array(buffer);

    await uploadPendingFile({
      fileId: id,
      actor: {
        id: session.user.id,
        role: session.user.role,
        loginId: session.user.loginId,
      },
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
      message === 'Forbidden' ? 403 :
      message === 'File not found.' ? 404 :
      message === 'Unauthorized' ? 401 :
      400;
    return NextResponse.json({ error: message }, { status });
  }
}
