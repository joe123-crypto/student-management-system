import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import {
  AnnouncementValidationError,
  createAnnouncement,
  listAnnouncements,
} from '@/lib/announcements/store';
import { UserRole } from '@/types';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return unauthorized();
  }

  try {
    const announcements = await listAnnouncements();
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('[ANNOUNCEMENTS] Failed to list announcements:', error);
    return NextResponse.json({ error: 'Failed to load announcements.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role || !session.user.id) {
    return unauthorized();
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return forbidden();
  }

  try {
    const body = (await request.json()) as { title?: unknown; content?: unknown };
    const title = typeof body.title === 'string' ? body.title : '';
    const content = typeof body.content === 'string' ? body.content : '';

    if (!title.trim() || !content.trim()) {
      return NextResponse.json({ error: 'Announcement title and content are required.' }, { status: 400 });
    }

    const announcement = await createAnnouncement({
      title,
      content,
      authorName: session.user.loginId || 'Attache Officer',
      authorUserId: session.user.id,
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    if (error instanceof AnnouncementValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('[ANNOUNCEMENTS] Failed to create announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement.' }, { status: 500 });
  }
}
