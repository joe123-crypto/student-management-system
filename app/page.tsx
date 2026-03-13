import { unstable_noStore as noStore } from 'next/cache';
import AppShell from '@/components/shell/AppShell';
import { listAnnouncements } from '@/lib/announcements/store';
import type { Announcement } from '@/types';
import { isMockDbEnabled } from '@/test/mock/config';
import { MOCK_ANNOUNCEMENTS } from '@/test/mock/announcements';

async function loadLatestAnnouncement(): Promise<Announcement | null> {
  if (isMockDbEnabled()) {
    return MOCK_ANNOUNCEMENTS[0] ?? null;
  }

  try {
    const announcements = await listAnnouncements();
    return announcements[0] ?? null;
  } catch (error) {
    console.error('[LANDING] Failed to load latest announcement:', error);
    return null;
  }
}

export default async function HomePage() {
  noStore();

  const latestAnnouncement = await loadLatestAnnouncement();

  return <AppShell route="/" latestAnnouncement={latestAnnouncement} />;
}

