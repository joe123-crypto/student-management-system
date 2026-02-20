import React from 'react';
import { cn } from './cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusClassMap: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide',
        statusClassMap[status] || 'bg-slate-100 text-slate-700',
        className,
      )}
    >
      {status}
    </span>
  );
}
