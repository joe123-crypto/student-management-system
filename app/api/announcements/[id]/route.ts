import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { AnnouncementValidationError, deleteAnnouncement } from '@/lib/announcements/store';
import { UserRole } from '@/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await deleteAnnouncement(id, session.user.id);
    return NextResponse.json({ deletedId: id });
  } catch (error) {
    if (error instanceof AnnouncementValidationError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('[ANNOUNCEMENTS] Failed to delete announcement:', error);
    return NextResponse.json({ error: 'Failed to delete announcement.' }, { status: 500 });
  }
}
