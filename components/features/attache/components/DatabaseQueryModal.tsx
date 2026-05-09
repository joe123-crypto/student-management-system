'use client';

import React, { useEffect } from 'react';
import { Database, X } from 'lucide-react';
import type {
  DatabaseQueryClause,
  StudentReturnField,
} from '@/components/features/attache/types';
import DatabaseQueryBuilder from '@/components/features/attache/components/DatabaseQueryBuilder';

interface DatabaseQueryModalProps {
  open: boolean;
  initialQueryClauses: DatabaseQueryClause[];
  initialReturnFields: StudentReturnField[];
  onClose: () => void;
  onApply: (payload: {
    queryClauses: DatabaseQueryClause[];
    returnFields: StudentReturnField[];
  }) => void;
}

export default function DatabaseQueryModal({
  open,
  initialQueryClauses,
  initialReturnFields,
  onClose,
  onApply,
}: DatabaseQueryModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="theme-overlay absolute inset-0" onClick={onClose} />

      <div className="theme-panel-glass relative z-10 flex h-[min(40rem,calc(100vh-2rem))] w-full max-w-[56rem] flex-col overflow-hidden rounded-[1.75rem] border p-5 shadow-xl md:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="theme-icon-well inline-flex h-10 w-10 items-center justify-center rounded-xl border">
              <Database className="h-[18px] w-[18px]" />
            </div>
            <h3 className="theme-heading text-lg font-bold md:text-[1.7rem]">Query Student Database</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="theme-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:scale-[1.02]"
            aria-label="Close database query popup"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <DatabaseQueryBuilder
          initialQueryClauses={initialQueryClauses}
          initialReturnFields={initialReturnFields}
          onApply={(payload) => {
            onApply(payload);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
