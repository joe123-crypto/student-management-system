'use client';

import { useEffect, useState } from 'react';
import { isMockDbEnabled } from '@/test/mock/config';
import { mockAnnouncementsService } from '@/test/mock/services/announcementsService';
import type { Announcement, User } from '@/types';
import { UserRole } from '@/types';

function prependAnnouncement(announcements: Announcement[], nextAnnouncement: Announcement): Announcement[] {
  const withoutExisting = announcements.filter((announcement) => announcement.id !== nextAnnouncement.id);
  return [nextAnnouncement, ...withoutExisting];
}

export function useAnnouncements(user: User | null) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function loadAnnouncements() {
      if (isMockDbEnabled()) {
        if (!user) {
          if (!isCancelled) {
            setAnnouncements([]);
            setIsHydrated(true);
          }
          return;
        }

        try {
          const storedAnnouncements = mockAnnouncementsService.loadAnnouncements();
          if (!isCancelled) {
            setAnnouncements(storedAnnouncements);
          }
        } catch (error) {
          console.error('[ANNOUNCEMENTS] Failed to hydrate mock announcements:', error);
          if (!isCancelled) {
            setAnnouncements([]);
          }
        } finally {
          if (!isCancelled) {
            setIsHydrated(true);
          }
        }

        return;
      }

      if (!user) {
        if (!isCancelled) {
          setAnnouncements([]);
          setIsHydrated(true);
        }
        return;
      }

      setIsHydrated(false);

      try {
        const response = await fetch('/api/announcements', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load announcements (${response.status}).`);
        }

        const payload = (await response.json()) as { announcements?: Announcement[] };
        if (!isCancelled) {
          setAnnouncements(payload.announcements || []);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[ANNOUNCEMENTS] Failed to hydrate announcements:', error);
        }

        if (!isCancelled) {
          setAnnouncements([]);
        }
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    }

    void loadAnnouncements();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [user]);

  async function addAnnouncement(input: { title: string; content: string }) {
    if (!input.title.trim() || !input.content.trim()) {
      throw new Error('Announcement title and content are required.');
    }

    if (isMockDbEnabled()) {
      if (user?.role !== UserRole.ATTACHE) {
        throw new Error('Attache session not found. Please sign in again.');
      }

      const nextAnnouncement: Announcement = {
        id: Math.random().toString(36).slice(2, 11),
        title: input.title.trim(),
        content: input.content.trim(),
        date: new Date().toISOString().slice(0, 10),
        author: user.loginId || 'Attache Officer',
      };

      const nextAnnouncements = prependAnnouncement(announcements, nextAnnouncement);
      mockAnnouncementsService.saveAnnouncements(nextAnnouncements);
      setAnnouncements(nextAnnouncements);
      return;
    }

    if (user?.role !== UserRole.ATTACHE) {
      throw new Error('Attache session not found. Please sign in again.');
    }

    const response = await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as { announcement?: Announcement; error?: string };
    if (!response.ok || !payload.announcement) {
      throw new Error(payload.error || `Failed to create announcement (${response.status}).`);
    }

    setAnnouncements((current) => prependAnnouncement(current, payload.announcement!));
  }

  async function deleteAnnouncement(id: string) {
    if (!id.trim()) {
      return;
    }

    if (isMockDbEnabled()) {
      const nextAnnouncements = announcements.filter((announcement) => announcement.id !== id);
      mockAnnouncementsService.saveAnnouncements(nextAnnouncements);
      setAnnouncements(nextAnnouncements);
      return;
    }

    if (user?.role !== UserRole.ATTACHE) {
      throw new Error('Attache session not found. Please sign in again.');
    }

    const response = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error || `Failed to delete announcement (${response.status}).`);
    }

    setAnnouncements((current) => current.filter((announcement) => announcement.id !== id));
  }

  return {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    isHydrated,
  };
}
