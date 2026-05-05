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
  const displayStatus = status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <span
      className={cn(
        'rounded-full px-3 py-1.5 text-sm font-bold',
        statusClassMap[status] || 'theme-card-muted theme-text-muted',
        className,
      )}
    >
      {displayStatus}
    </span>
  );
}
