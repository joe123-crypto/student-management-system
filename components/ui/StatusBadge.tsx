import React from 'react';
import { cn } from './cn';
import {
  formatStudentStatus,
  getStudentStatusThemeClass,
  normalizeStudentStatusKey,
} from '@/lib/students/status';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = normalizeStudentStatusKey(status);

  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.03em]',
        getStudentStatusThemeClass(status),
        normalizedStatus === 'pending' && 'theme-attention-pulse',
        className,
      )}
    >
      {formatStudentStatus(status)}
    </span>
  );
}
