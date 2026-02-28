import React, { useState } from 'react';
import type { Announcement } from '@/types';
import Button from '@/components/ui/Button';
import {
  AnnouncementComposerCard,
  AnnouncementFeedSection,
} from '@/components/features/shared/announcements/AnnouncementSections';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  onAddAnnouncement: (a: Announcement) => void;
}

export default function AnnouncementsSection({
  announcements,
  onAddAnnouncement,
}: AnnouncementsSectionProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const announcement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      content: newContent,
      date: new Date().toISOString().split('T')[0],
      author: 'Attache Officer',
    };

    onAddAnnouncement(announcement);
    setNewTitle('');
    setNewContent('');
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
        />
      </div>
      <div className="md:col-span-2 space-y-4">
        <AnnouncementFeedSection
          announcements={announcements}
          title="Past Announcements"
          compact
          actions={() => (
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
              Delete
            </Button>
          )}
        />
      </div>
    </div>
  );
}
