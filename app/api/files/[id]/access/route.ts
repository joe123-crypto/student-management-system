import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { createFileAccess } from '@/lib/files/store';
import { getClientIp } from '@/lib/security/request';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { disposition?: unknown };
    const disposition =
      body.disposition === 'inline' || body.disposition === 'attachment'
        ? body.disposition
        : 'attachment';
    const { id } = await context.params;

    const access = await createFileAccess({
      fileId: id,
      disposition,
      actor: {
        id: session.user.id,
        role: session.user.role,
        loginId: session.user.loginId,
      },
      audit: {
        ip: getClientIp(request.headers) ?? undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json({
      downloadUrl: access.url,
      expiresAt: access.expiresAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate file access.';
    const status =
      message === 'Forbidden' ? 403 :
      message === 'File not found.' ? 404 :
      message === 'Unauthorized' ? 401 :
      400;
    return NextResponse.json({ error: message }, { status });
  }
}
