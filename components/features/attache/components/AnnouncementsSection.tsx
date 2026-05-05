import React, { useState } from 'react';
import type { Announcement } from '@/types';
import Button from '@/components/ui/Button';
import {
  AnnouncementComposerCard,
  AnnouncementFeedSection,
} from '@/components/features/shared/announcements/AnnouncementSections';
import Skeleton from '@/components/ui/Skeleton';
import { useNotification } from '@/components/providers/NotificationProvider';
import { Megaphone } from 'lucide-react';

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
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);
  const { notify } = useNotification();

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onAddAnnouncement({
        title: newTitle,
        content: newContent,
      });
      setNewTitle('');
      setNewContent('');
      notify('Announcement posted.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to post announcement right now.',
      );
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
        {errorMessage ? (
          <p className="mt-3 text-sm text-[color:var(--theme-danger)]">{errorMessage}</p>
        ) : null}
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
        ) : announcements.length === 0 ? (
          <div className="theme-card flex min-h-[420px] flex-col items-center justify-center rounded-3xl border p-8 text-center">
            <div className="theme-info flex h-14 w-14 items-center justify-center rounded-2xl border">
              <Megaphone className="h-7 w-7" />
            </div>
            <h3 className="theme-heading mt-4 text-lg font-bold">No announcements yet</h3>
            <p className="theme-text-muted mt-2 max-w-md text-sm">Post the first update to make it visible to students.</p>
          </div>
        ) : (
          <AnnouncementFeedSection
            announcements={announcements}
            title="Past Announcements"
            compact
            className="theme-card min-h-[420px] rounded-3xl border p-6"
            emptyMessage="No announcements yet. Published updates will appear here."
            actions={(announcement) => (
              <Button
                variant="ghost"
                size="sm"
                className="text-[color:var(--theme-danger)] hover:bg-[rgba(183,76,45,0.08)] hover:text-[color:var(--theme-danger-strong)]"
                disabled={deletingAnnouncementId === announcement.id}
                onClick={async () => {
                  setErrorMessage(null);
                  setDeletingAnnouncementId(announcement.id);
                  try {
                    await onDeleteAnnouncement(announcement.id);
                    notify('Announcement deleted.', 'danger');
                  } catch (error) {
                    setErrorMessage(
                      error instanceof Error ? error.message : 'Unable to delete announcement right now.',
                    );
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
