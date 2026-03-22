import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { createFileAccess } from '@/lib/files/store';
import { getClientIp } from '@/lib/security/request';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const access = await createFileAccess({
      fileId: id,
      disposition: 'inline',
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

    return NextResponse.redirect(access.url, {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load file content.';
    const status =
      message === 'Forbidden' ? 403 :
      message === 'File not found.' ? 404 :
      message === 'Unauthorized' ? 401 :
      400;
    return NextResponse.json({ error: message }, { status });
  }
}
