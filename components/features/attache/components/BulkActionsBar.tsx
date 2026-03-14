import React from 'react';
import Button from '@/components/ui/Button';
import { FileDown, Mail, Trash2 } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onMarkReviewed: () => void;
  onRequestMissingDocs: () => void;
  onExportSelected: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onMarkReviewed,
  onRequestMissingDocs,
  onExportSelected,
  onClearSelection,
  onDeleteSelected,
}: BulkActionsBarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="theme-accent-subtle flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
      <p className="theme-accent text-sm font-bold">
        {selectedCount} student{selectedCount !== 1 ? 's' : ''} selected
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={onMarkReviewed} disabled={!hasSelection}>
          Mark Reviewed
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={onRequestMissingDocs}
          disabled={!hasSelection}
          className="px-3"
          title="Request Missing Docs"
          aria-label="Request Missing Docs"
        >
          <Mail className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="success"
          onClick={onExportSelected}
          disabled={!hasSelection}
          className="px-3"
          title="Export Selected"
          aria-label="Export Selected"
        >
          <FileDown className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onClearSelection} disabled={!hasSelection}>
          Clear
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className="px-3"
          title="Delete Selected"
          aria-label="Delete Selected"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
