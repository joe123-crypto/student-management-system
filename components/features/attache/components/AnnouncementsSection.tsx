import React, { useState } from 'react';
import type { Announcement } from '@/types';
import Button from '@/components/ui/Button';
import {
  AnnouncementComposerCard,
  AnnouncementFeedSection,
} from '@/components/features/shared/announcements/AnnouncementSections';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  onAddAnnouncement: (input: { title: string; content: string }) => Promise<void>;
  onDeleteAnnouncement: (announcementId: string) => Promise<void>;
}

export default function AnnouncementsSection({
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
}: AnnouncementsSectionProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);

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
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to post announcement right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <AnnouncementComposerCard
          announcementTitle={newTitle}
          announcementContent={newContent}
          onAnnouncementTitleChange={setNewTitle}
          onAnnouncementContentChange={setNewContent}
          onSubmit={handlePostAnnouncement}
          submitLabel={isSubmitting ? 'Posting...' : 'Post Announcement'}
        />
        {errorMessage ? (
          <p className="mt-3 text-sm text-rose-600">{errorMessage}</p>
        ) : null}
      </div>
      <div className="md:col-span-2 space-y-4">
        <AnnouncementFeedSection
          announcements={announcements}
          title="Past Announcements"
          compact
          actions={(announcement) => (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              disabled={deletingAnnouncementId === announcement.id}
              onClick={async () => {
                setErrorMessage(null);
                setDeletingAnnouncementId(announcement.id);
                try {
                  await onDeleteAnnouncement(announcement.id);
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
      </div>
    </div>
  );
}
