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
          ? 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'
          : 'rounded-3xl border border-slate-100 bg-slate-50/50 p-5 transition-all group hover:bg-white sm:p-8',
        className,
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h5
            className={cn(
              'text-lg font-extrabold text-[#1a1b3a] sm:text-xl',
              !compact && 'group-hover:text-indigo-600 transition-colors',
            )}
          >
            {announcement.title}
          </h5>
          {compact && (
            <p className="text-xs text-slate-400">
              Published on {announcement.date} by {announcement.author}
            </p>
          )}
        </div>
        {actions ?? (
          <span className="text-xs font-bold text-slate-400 tracking-wider bg-white px-3 py-1 rounded-full border border-slate-100">
            {announcement.date}
          </span>
        )}
      </div>
      <p className="text-sm font-medium leading-relaxed text-slate-500 sm:text-base">{announcement.content}</p>
    </div>
  );
}
