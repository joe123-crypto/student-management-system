import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { getFileSummary } from '@/lib/files/store';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const file = await getFileSummary(id, {
      id: session.user.id,
      role: session.user.role,
      loginId: session.user.loginId,
    });

    return NextResponse.json({ file });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load file.';
    const status =
      message === 'File not found.' ? 404 : message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
