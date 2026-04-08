import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ProgressDetails } from '@/types';
import StatusBadge from './StatusBadge';
import Button from './Button';

interface AcademicHistoryItemProps {
  entry: ProgressDetails;
  onDelete?: (entry: ProgressDetails) => void;
  isDeleting?: boolean;
}

export default function AcademicHistoryItem({
  entry,
  onDelete,
  isDeleting = false,
}: AcademicHistoryItemProps) {
  return (
    <div className="theme-card-muted flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <p className="theme-heading text-sm font-bold">
          {entry.year} - {entry.level}
        </p>
        <p className="theme-text-muted text-xs font-medium">Submitted on {entry.date}</p>
      </div>
      <div className="flex flex-col gap-3 text-left sm:items-end sm:text-right">
        <div className="space-y-1">
          <p className="theme-accent type-card-title sm:text-lg">{entry.grade}/20</p>
          <StatusBadge status={entry.status} />
        </div>
        {onDelete ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(entry)}
            disabled={isDeleting}
            className="sm:self-end"
            aria-label={`Delete progress record ${entry.year} ${entry.level}`}
            title="Delete progress record"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
