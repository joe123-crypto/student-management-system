import React from 'react';
import Button from '@/components/ui/Button';
import {
  CheckCheck,
  FileDown,
  Trash2,
  X,
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onMarkReviewed: () => void;
  onExportSelected: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onMarkReviewed,
  onExportSelected,
  onClearSelection,
  onDeleteSelected,
}: BulkActionsBarProps) {
  const hasSelection = selectedCount > 0;

  if (!hasSelection) {
    return null;
  }

  return (
    <div className="theme-card sticky top-[9rem] z-20 rounded-2xl border p-4 shadow-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="theme-heading text-base font-bold">
          {selectedCount} selected
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="danger" size="md" onClick={onDeleteSelected}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button variant="secondary" size="md" onClick={onExportSelected}>
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button variant="secondary" size="md" onClick={onMarkReviewed}>
            <CheckCheck className="h-4 w-4" />
            Mark Reviewed
          </Button>
          <Button variant="ghost" size="md" onClick={onClearSelection} aria-label="Clear selection">
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
