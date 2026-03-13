import { getFromStorage } from '@/components/shell/shared/storage';
import { MOCK_ANNOUNCEMENTS } from '@/test/mock/announcements';
import type { AnnouncementsService } from '@/services/contracts';
import type { Announcement } from '@/types';

const ANNOUNCEMENTS_STORAGE_KEY = 'announcements';

export const mockAnnouncementsService: AnnouncementsService = {
  loadAnnouncements() {
    return getFromStorage<Announcement[]>(ANNOUNCEMENTS_STORAGE_KEY, MOCK_ANNOUNCEMENTS);
  },
  saveAnnouncements(announcements) {
    window.localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
  },
};

