import React from 'react';
import type { Announcement } from '@/types';
import { cn } from './cn';

interface AnnouncementCardProps {
  announcement: Announcement;
  className?: string;
  titleClassName?: string;
  compact?: boolean;
  actions?: React.ReactNode;
}

export default function AnnouncementCard({
  announcement,
  className,
  titleClassName,
  compact = false,
  actions,
}: AnnouncementCardProps) {
  return (
    <div
      className={cn(
        compact
          ? 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'
          : 'p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white transition-all group',
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <div>
          <h5 className={cn('text-xl font-extrabold text-[#1a1b3a]', !compact && 'group-hover:text-indigo-600 transition-colors', titleClassName)}>
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
      <p className="text-slate-500 leading-relaxed font-medium">{announcement.content}</p>
    </div>
  );
}
