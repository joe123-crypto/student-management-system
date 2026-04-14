import React, { useState } from 'react';
import type { Announcement } from '@/types';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/components/providers/NotificationProvider';
import {
  AnnouncementComposerCard,
  AnnouncementFeedSection,
} from '@/components/features/shared/announcements/AnnouncementSections';
import Skeleton from '@/components/ui/Skeleton';
import { getErrorMessage } from '@/lib/errors';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  isLoading?: boolean;
  onAddAnnouncement: (input: { title: string; content: string }) => Promise<void>;
  onDeleteAnnouncement: (announcementId: string) => Promise<void>;
}

export default function AnnouncementsSection({
  announcements,
  isLoading = false,
  onAddAnnouncement,
  onDeleteAnnouncement,
}: AnnouncementsSectionProps) {
  const notifications = useNotifications();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsSubmitting(true);

    try {
      await onAddAnnouncement({
        title: newTitle,
        content: newContent,
      });
      setNewTitle('');
      setNewContent('');
      notifications.notify({
        tone: 'success',
        title: 'Announcement posted',
        message: 'The new update is now visible to students.',
      });
    } catch (error) {
      notifications.notify({
        tone: 'error',
        title: 'Could not post announcement',
        message: getErrorMessage(error, 'Unable to post announcement right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
      <div>
        <AnnouncementComposerCard
          announcementTitle={newTitle}
          announcementContent={newContent}
          onAnnouncementTitleChange={setNewTitle}
          onAnnouncementContentChange={setNewContent}
          onSubmit={handlePostAnnouncement}
          submitLabel={isSubmitting ? 'Posting...' : 'Post Announcement'}
          className="theme-card sticky top-24 rounded-3xl border p-6 shadow-sm"
        />
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="theme-card min-h-[420px] rounded-3xl border p-6">
            <Skeleton className="h-6 w-48" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          </div>
        ) : (
          <AnnouncementFeedSection
            announcements={announcements}
            title="Past Announcements"
            compact
            className="theme-card min-h-[420px] rounded-3xl border p-6"
            emptyMessage="Post the first announcement."
            actions={(announcement) => (
              <Button
                variant="ghost"
                size="sm"
                className="text-[color:var(--theme-danger)] hover:bg-[rgba(183,76,45,0.08)] hover:text-[color:var(--theme-danger-strong)]"
                disabled={deletingAnnouncementId === announcement.id}
                onClick={async () => {
                  setDeletingAnnouncementId(announcement.id);
                  try {
                    await onDeleteAnnouncement(announcement.id);
                    notifications.notify({
                      tone: 'success',
                      title: 'Announcement deleted',
                      message: 'The selected announcement has been removed.',
                      durationMs: 3200,
                    });
                  } catch (error) {
                    notifications.notify({
                      tone: 'error',
                      title: 'Could not delete announcement',
                      message: getErrorMessage(error, 'Unable to delete announcement right now.'),
                    });
                  } finally {
                    setDeletingAnnouncementId((current) =>
                      current === announcement.id ? null : current,
                    );
                  }
                }}
              >
                {deletingAnnouncementId === announcement.id ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          />
        )}
      </div>
    </div>
  );
}
