'use client';

import { useEffect, useState } from 'react';
import type { Announcement } from '@/types';
import { MOCK_ANNOUNCEMENTS } from '@/constants';
import { getFromStorage } from '@/components/shell/shared/storage';

const ANNOUNCEMENTS_STORAGE_KEY = 'announcements';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setAnnouncements(getFromStorage<Announcement[]>(ANNOUNCEMENTS_STORAGE_KEY, MOCK_ANNOUNCEMENTS));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
  }, [announcements, isHydrated]);

  const addAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) => [announcement, ...prev]);
  };

  return {
    announcements,
    addAnnouncement,
    isHydrated,
  };
}

