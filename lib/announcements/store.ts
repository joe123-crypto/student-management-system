import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auth/store';
import { normalizeAnnouncementInput, toAnnouncement } from '@/lib/announcements/serializers';
import type { Announcement } from '@/types';

export class AnnouncementValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnnouncementValidationError';
  }
}

export async function listAnnouncements(): Promise<Announcement[]> {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  return announcements.map(toAnnouncement);
}

export async function createAnnouncement(params: {
  title: string;
  content: string;
  authorName: string;
  authorUserId?: string;
}): Promise<Announcement> {
  const input = normalizeAnnouncementInput({
    title: params.title,
    content: params.content,
  });

  const announcement = await prisma.announcement.create({
    data: {
      title: input.title,
      content: input.content,
      authorName: params.authorName.trim() || 'Attache Officer',
      authorUserId: params.authorUserId,
    },
  });

  if (params.authorUserId) {
    await recordAuditLog({
      userId: params.authorUserId,
      event: 'announcement_created',
      metadata: { announcementId: announcement.id },
    });
  }

  return toAnnouncement(announcement);
}

export async function deleteAnnouncement(id: string, deletedByUserId?: string): Promise<void> {
  const existing = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AnnouncementValidationError('Announcement not found.');
  }

  await prisma.announcement.delete({
    where: { id },
  });

  if (deletedByUserId) {
    await recordAuditLog({
      userId: deletedByUserId,
      event: 'announcement_deleted',
      metadata: { announcementId: id },
    });
  }
}
