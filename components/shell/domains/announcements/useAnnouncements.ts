'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppError } from '@/components/providers/AppErrorProvider';
import {
  getRuntimeCacheKey,
  readCache,
  writeCache,
} from '@/components/shell/shared/browser-cache';
import { isAbortError } from '@/lib/errors';
import { isMockDbEnabled } from '@/test/mock/config';
import { mockAnnouncementsService } from '@/test/mock/services/announcementsService';
import type { Announcement, User } from '@/types';
import { UserRole } from '@/types';

const ANNOUNCEMENTS_CACHE_TTL_MS = 5 * 60 * 1000;
const EMPTY_ANNOUNCEMENTS: Announcement[] = [];

function prependAnnouncement(announcements: Announcement[], nextAnnouncement: Announcement): Announcement[] {
  const withoutExisting = announcements.filter((announcement) => announcement.id !== nextAnnouncement.id);
  return [nextAnnouncement, ...withoutExisting];
}

export function useAnnouncements(
  user: User | null,
  initialAnnouncements: Announcement[] = EMPTY_ANNOUNCEMENTS,
  options: {
    skipInitialRefresh?: boolean;
  } = {},
) {
  const { reportError } = useAppError();
  const { skipInitialRefresh = false } = options;
  const userKey = user ? `${user.role}:${user.id}:${user.loginId}` : 'anonymous';
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [hydratedKey, setHydratedKey] = useState<string | null>(
    user ? userKey : initialAnnouncements.length > 0 ? 'anonymous' : null,
  );
  const announcementsRef = useRef<Announcement[]>([]);
  const isHydrated = hydratedKey === userKey;

  useEffect(() => {
    announcementsRef.current = announcements;
  }, [announcements]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setAnnouncements((current) => (current.length > 0 ? current : initialAnnouncements));
    setHydratedKey((current) => current ?? userKey);
  }, [initialAnnouncements, user, userKey]);

  function setAnnouncementsState(nextAnnouncements: Announcement[]) {
    announcementsRef.current = nextAnnouncements;
    setAnnouncements(nextAnnouncements);
  }

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function loadAnnouncements() {
      if (isMockDbEnabled()) {
        if (!user) {
          if (!isCancelled) {
            setAnnouncementsState([]);
            setHydratedKey(userKey);
          }
          return;
        }

        try {
          const storedAnnouncements = mockAnnouncementsService.loadAnnouncements();
          if (!isCancelled) {
            setAnnouncementsState(storedAnnouncements);
          }
        } catch (error) {
          console.error('[ANNOUNCEMENTS] Failed to hydrate mock announcements:', error);
          if (!isCancelled) {
            setAnnouncementsState([]);
          }
        } finally {
          if (!isCancelled) {
            setHydratedKey(userKey);
          }
        }

        return;
      }

      if (!user) {
        if (!isCancelled) {
          setAnnouncementsState([]);
          setHydratedKey(userKey);
        }
        return;
      }

      if (skipInitialRefresh) {
        setHydratedKey(userKey);
        return;
      }

      const cacheKey = getRuntimeCacheKey(user, 'announcements');
      let hasCachedAnnouncements = false;

      try {
        try {
          const cachedAnnouncements = await readCache<Announcement[]>(cacheKey);
          if (!isCancelled && cachedAnnouncements) {
            hasCachedAnnouncements = true;
            setAnnouncementsState(cachedAnnouncements);
            setHydratedKey(userKey);
          }
        } catch (error) {
          console.error('[ANNOUNCEMENTS] Failed to read IndexedDB announcement cache:', error);
        }

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
          const nextAnnouncements = payload.announcements || [];
          setAnnouncementsState(nextAnnouncements);
          void writeCache(cacheKey, nextAnnouncements, ANNOUNCEMENTS_CACHE_TTL_MS).catch((error) => {
            console.error('[ANNOUNCEMENTS] Failed to write IndexedDB announcement cache:', error);
          });
        }
      } catch (error) {
        if (!isAbortError(error)) {
          console.error('[ANNOUNCEMENTS] Failed to hydrate announcements:', error);

          if (!isCancelled && !hasCachedAnnouncements) {
            reportError(error, {
              title: 'Could not load announcements',
              fallback: 'Announcements are unavailable right now. Please refresh and try again.',
            });
          }
        }

        if (!isCancelled && !hasCachedAnnouncements) {
          setAnnouncementsState([]);
        }
      } finally {
        if (!isCancelled) {
          setHydratedKey(userKey);
        }
      }
    }

    void loadAnnouncements();

    return () => {
      isCancelled = true;
      if (!controller.signal.aborted) {
        controller.abort();
      }
    };
  }, [reportError, skipInitialRefresh, user, userKey]);

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

      const nextAnnouncements = prependAnnouncement(announcementsRef.current, nextAnnouncement);
      mockAnnouncementsService.saveAnnouncements(nextAnnouncements);
      setAnnouncementsState(nextAnnouncements);
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

    const nextAnnouncements = prependAnnouncement(announcementsRef.current, payload.announcement);
    setAnnouncementsState(nextAnnouncements);
    void writeCache(
      getRuntimeCacheKey(user, 'announcements'),
      nextAnnouncements,
      ANNOUNCEMENTS_CACHE_TTL_MS,
    ).catch((error) => {
      console.error('[ANNOUNCEMENTS] Failed to write IndexedDB announcement cache:', error);
    });
  }

  async function deleteAnnouncement(id: string) {
    if (!id.trim()) {
      return;
    }

    if (isMockDbEnabled()) {
      const nextAnnouncements = announcementsRef.current.filter((announcement) => announcement.id !== id);
      mockAnnouncementsService.saveAnnouncements(nextAnnouncements);
      setAnnouncementsState(nextAnnouncements);
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

    const nextAnnouncements = announcementsRef.current.filter((announcement) => announcement.id !== id);
    setAnnouncementsState(nextAnnouncements);
    void writeCache(
      getRuntimeCacheKey(user, 'announcements'),
      nextAnnouncements,
      ANNOUNCEMENTS_CACHE_TTL_MS,
    ).catch((error) => {
      console.error('[ANNOUNCEMENTS] Failed to write IndexedDB announcement cache:', error);
    });
  }

  return {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    isHydrated,
  };
}
