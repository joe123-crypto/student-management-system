import React from 'react';
import { cn } from './cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusClassMap: Record<string, string> = {
  ACTIVE: 'theme-success',
  PENDING: 'theme-warning',
  COMPLETED: 'theme-info',
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide',
        statusClassMap[status] || 'theme-card-muted theme-text-muted',
        className,
      )}
    >
      {status}
    </span>
  );
}
