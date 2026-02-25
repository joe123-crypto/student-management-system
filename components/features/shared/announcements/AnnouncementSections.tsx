import React from 'react';
import type { Announcement } from '@/types';
import AnnouncementCard from '@/components/ui/AnnouncementCard';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import SectionHeader from '@/components/ui/SectionHeader';

interface AnnouncementFeedSectionProps {
  announcements: Announcement[];
  title: string;
  compact?: boolean;
  titleVariant?: 'headline' | 'section';
  className?: string;
  listClassName?: string;
  emptyMessage?: string;
  actions?: (announcement: Announcement) => React.ReactNode;
}

interface AnnouncementComposerCardProps {
  title?: string;
  announcementTitle: string;
  announcementContent: string;
  onAnnouncementTitleChange: (value: string) => void;
  onAnnouncementContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  className?: string;
}

export function AnnouncementFeedSection({
  announcements,
  title,
  compact = false,
  titleVariant = 'section',
  className,
  listClassName = 'space-y-4',
  emptyMessage = 'No announcements yet.',
  actions,
}: AnnouncementFeedSectionProps) {
  return (
    <div className={className}>
      {titleVariant === 'headline' ? (
        <h4 className="text-2xl font-black text-slate-900 mb-8 font-rounded">{title}</h4>
      ) : (
        <SectionHeader title={title} className="mb-4" />
      )}
      <div className={listClassName}>
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              compact={compact}
              actions={actions ? actions(announcement) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function AnnouncementComposerCard({
  title = 'Create Announcement',
  announcementTitle,
  announcementContent,
  onAnnouncementTitleChange,
  onAnnouncementContentChange,
  onSubmit,
  submitLabel = 'Post Announcement',
  className,
}: AnnouncementComposerCardProps) {
  return (
    <div className={className ?? 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24'}>
      <SectionHeader title={title} className="mb-6" />
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Title">
          <input
            type="text"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={announcementTitle}
            onChange={(e) => onAnnouncementTitleChange(e.target.value)}
          />
        </FormField>
        <FormField label="Content">
          <textarea
            rows={4}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={announcementContent}
            onChange={(e) => onAnnouncementContentChange(e.target.value)}
          />
        </FormField>
        <Button type="submit" fullWidth>
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}
