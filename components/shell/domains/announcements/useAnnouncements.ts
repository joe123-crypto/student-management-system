'use client';

import { useEffect, useState } from 'react';
import type { Announcement } from '@/types';
import { MOCK_ANNOUNCEMENTS } from '@/constants';
import { services } from '@/services';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setAnnouncements(services.announcements.loadAnnouncements());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    services.announcements.saveAnnouncements(announcements);
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

