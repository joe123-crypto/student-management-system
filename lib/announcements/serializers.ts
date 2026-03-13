import type { Announcement as AnnouncementRecord } from '@prisma/client';
import type { Announcement } from '@/types';

function formatAnnouncementDate(createdAt: Date): string {
  return createdAt.toISOString().slice(0, 10);
}

export function toAnnouncement(record: AnnouncementRecord): Announcement {
  return {
    id: record.id,
    title: record.title,
    content: record.content,
    date: formatAnnouncementDate(record.createdAt),
    author: record.authorName,
  };
}

export function normalizeAnnouncementInput(input: {
  title: string;
  content: string;
}): { title: string; content: string } {
  return {
    title: input.title.trim(),
    content: input.content.trim(),
  };
}
