import React from 'react';
import type { Announcement } from '@/types';
import { cn } from './cn';

interface AnnouncementCardProps {
  announcement: Announcement;
  className?: string;
  compact?: boolean;
  actions?: React.ReactNode;
}

export default function AnnouncementCard({
  announcement,
  className,
  compact = false,
  actions,
}: AnnouncementCardProps) {
  return (
    <div
      className={cn(
        compact
          ? 'theme-card rounded-2xl border p-5 sm:p-6'
          : 'theme-card-muted rounded-3xl border p-5 transition-all group hover:bg-[var(--theme-card)] sm:p-8',
        className,
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h5
            className={cn(
              'theme-heading text-lg font-extrabold sm:text-xl',
              !compact && 'group-hover:text-[var(--theme-primary)] transition-colors',
            )}
          >
            {announcement.title}
          </h5>
          {compact && (
            <p className="theme-text-muted text-xs">
              Published on {announcement.date} by {announcement.author}
            </p>
          )}
        </div>
        {actions ?? (
          <span className="theme-card theme-text-muted rounded-full border px-3 py-1 text-xs font-bold tracking-wider">
            {announcement.date}
          </span>
        )}
      </div>
      <p className="theme-text-muted text-sm font-medium leading-relaxed sm:text-base">{announcement.content}</p>
    </div>
  );
}
