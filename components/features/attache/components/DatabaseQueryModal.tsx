'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Database, Plus, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { cn } from '@/components/ui/cn';
import type {
  DatabaseQueryClause,
  QueryField,
  StudentReturnField,
} from '@/components/features/attache/types';
import {
  createDatabaseQueryClause,
  DEFAULT_RETURN_FIELDS,
} from '@/components/features/attache/utils/studentData';

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

const QUERY_FIELD_OPTIONS: Array<{ value: QueryField; label: string }> = [
  { value: 'all', label: 'All fields' },
  { value: 'fullName', label: 'Student name' },
  { value: 'inscription', label: 'Inscription no.' },
  { value: 'email', label: 'Email' },
  { value: 'university', label: 'University' },
  { value: 'program', label: 'Program' },
];

const RETURN_FIELD_OPTIONS: Array<{ value: StudentReturnField; label: string }> = [
  { value: 'fullName', label: 'Full Name' },
  { value: 'inscription', label: 'Inscription No.' },
  { value: 'email', label: 'Email' },
  { value: 'university', label: 'University' },
  { value: 'program', label: 'Program' },
  { value: 'degreeLevel', label: 'Degree Level' },
  { value: 'status', label: 'Status' },
  { value: 'phone', label: 'Phone' },
];

export default function DatabaseQueryModal({
  open,
  initialQueryClauses,
  initialReturnFields,
  onClose,
  onApply,
}: DatabaseQueryModalProps) {
  const [queryClauses, setQueryClauses] = useState<DatabaseQueryClause[]>([createDatabaseQueryClause()]);
  const [returnFields, setReturnFields] = useState<StudentReturnField[]>(DEFAULT_RETURN_FIELDS);
  const [returnFieldsMenuOpen, setReturnFieldsMenuOpen] = useState(false);
  const queryListRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) {
      return;
    }

    setQueryClauses(
      initialQueryClauses.length > 0
        ? initialQueryClauses.map((clause) => ({ ...clause }))
        : [createDatabaseQueryClause()],
    );
    setReturnFields(initialReturnFields.length > 0 ? initialReturnFields : DEFAULT_RETURN_FIELDS);
    setReturnFieldsMenuOpen(false);
  }, [initialQueryClauses, initialReturnFields, open]);

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
            <div>
              <h3 className="theme-heading text-lg font-bold md:text-[1.7rem]">Query Student Database</h3>
              <p className="theme-text-muted mt-1 max-w-2xl text-[13px] leading-5 md:text-sm">
                Search the attache student records by name, inscription number, email, university, or program.
              </p>
            </div>
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

        <form
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
          onSubmit={(event) => {
            event.preventDefault();
            const normalizedClauses = queryClauses
              .map((clause) => ({
                ...clause,
                value: clause.value.trim(),
              }))
              .filter((clause) => clause.value.length > 0);
            onApply({
              queryClauses: normalizedClauses.length > 0 ? normalizedClauses : [createDatabaseQueryClause()],
              returnFields: returnFields.length > 0 ? returnFields : DEFAULT_RETURN_FIELDS,
            });
            onClose();
          }}
        >
          <div className="min-h-0 flex flex-1 flex-col rounded-[1.5rem] border border-[color:var(--theme-border)] bg-white/45 p-3.5">
            <div ref={queryListRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="space-y-3">
                {queryClauses.map((clause, index) => (
                  <div
                    key={clause.id}
                    className="grid gap-3 rounded-[1.25rem] border border-[rgba(220,205,166,0.7)] bg-white/55 p-3 md:grid-cols-[minmax(0,1.7fr)_12.5rem_auto]"
                  >
                    <label className="block">
                      <span className="theme-text-muted type-label mb-1.5 block">
                        {index === 0 ? 'Query' : `Query ${index + 1}`}
                      </span>
                      <div className="relative">
                        <input
                          type="text"
                          value={clause.value}
                          onChange={(event) =>
                            setQueryClauses((current) =>
                              current.map((item) =>
                                item.id === clause.id ? { ...item, value: event.target.value } : item,
                              ),
                            )
                          }
                          placeholder="Try Seed Student, STUDENT123, computer science..."
                          className="theme-input h-10 w-full rounded-xl border pl-10 pr-4 text-sm outline-none"
                        />
                        <Search className="theme-text-muted absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                      </div>
                    </label>

                    <label className="block">
                      <span className="theme-text-muted type-label mb-1.5 block">Field</span>
                      <select
                        value={clause.field}
                        onChange={(event) =>
                          setQueryClauses((current) =>
                            current.map((item) =>
                              item.id === clause.id ? { ...item, field: event.target.value as QueryField } : item,
                            ),
                          )
                        }
                        className="theme-input h-10 w-full rounded-xl border px-3.5 text-sm outline-none"
                      >
                        {QUERY_FIELD_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex items-end justify-end">
                      {queryClauses.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setQueryClauses((current) => current.filter((item) => item.id !== clause.id))
                          }
                          className="theme-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:scale-[1.02]"
                          aria-label={`Remove query ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="h-10 w-10" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex shrink-0 justify-end border-t border-[rgba(220,205,166,0.5)] pt-3">
              <button
                type="button"
                onClick={() => {
                  setQueryClauses((current) => [...current, createDatabaseQueryClause()]);
                  requestAnimationFrame(() => {
                    queryListRef.current?.scrollTo({
                      top: queryListRef.current.scrollHeight,
                      behavior: 'smooth',
                    });
                  });
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[color:var(--theme-primary-soft)] bg-white/80 text-[color:var(--theme-primary-soft)] transition hover:scale-[1.03] hover:bg-[rgba(245,130,74,0.08)]"
                aria-label="Add another query"
              >
                <Plus className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="relative shrink-0 rounded-[1.5rem] border border-[color:var(--theme-border)] bg-white/45 p-3.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="theme-text-muted type-label">Returned Fields</p>
                <p className="theme-text-muted mt-1 text-[13px] leading-5 md:text-sm">
                  Choose the columns that should be shown in the student records table for this query.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReturnFieldsMenuOpen((current) => !current)}
                className="theme-card-muted inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold text-[color:var(--theme-text)] transition hover:scale-[1.02]"
                aria-expanded={returnFieldsMenuOpen}
                aria-label="Toggle returned fields"
              >
                <span>{returnFields.length} selected</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    returnFieldsMenuOpen && 'rotate-180',
                  )}
                />
              </button>
            </div>

            {returnFieldsMenuOpen ? (
              <div className="absolute bottom-[calc(100%+0.5rem)] right-3 z-30 w-full max-w-[20rem] rounded-[1.25rem] border border-[color:var(--theme-border)] bg-[color:rgba(252,248,234,0.98)] p-2.5 shadow-[0_20px_56px_rgba(37,79,34,0.16)] backdrop-blur-sm">
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {RETURN_FIELD_OPTIONS.map((option) => {
                    const checked = returnFields.includes(option.value);

                    return (
                      <Checkbox
                        key={option.value}
                        checked={checked}
                        label={option.label}
                        containerClassName="theme-card-muted rounded-lg border px-3 py-2.5"
                        onChange={(event) => {
                          const nextChecked = event.target.checked;

                          setReturnFields((current) => {
                            if (nextChecked) {
                              return current.includes(option.value) ? current : [...current, option.value];
                            }

                            if (current.length === 1) {
                              return current;
                            }

                            return current.filter((field) => field !== option.value);
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQueryClauses([createDatabaseQueryClause()]);
                setReturnFields(DEFAULT_RETURN_FIELDS);
              }}
            >
              Clear
            </Button>
            <Button type="submit" size="sm">
              Query
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
