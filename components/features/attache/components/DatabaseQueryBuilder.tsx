'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { cn } from '@/components/ui/cn';
import type {
  DatabaseQueryClause,
  QueryField,
  StudentReturnField,
} from '@/components/features/attache/types';
import {
  ALL_RETURN_FIELDS,
  createDatabaseQueryClause,
  DEFAULT_RETURN_FIELDS,
  STUDENT_QUERY_FIELD_OPTIONS,
  STUDENT_RETURN_FIELD_OPTIONS,
} from '@/components/features/attache/utils/studentData';

interface DatabaseQueryBuilderProps {
  initialQueryClauses: DatabaseQueryClause[];
  initialReturnFields: StudentReturnField[];
  onApply: (payload: {
    queryClauses: DatabaseQueryClause[];
    returnFields: StudentReturnField[];
  }) => void;
}

export default function DatabaseQueryBuilder({
  initialQueryClauses,
  initialReturnFields,
  onApply,
}: DatabaseQueryBuilderProps) {
  const [queryClauses, setQueryClauses] = useState<DatabaseQueryClause[]>([createDatabaseQueryClause()]);
  const [returnFields, setReturnFields] = useState<StudentReturnField[]>(DEFAULT_RETURN_FIELDS);
  const [returnFieldsMenuOpen, setReturnFieldsMenuOpen] = useState(false);
  const queryListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQueryClauses(
      initialQueryClauses.length > 0
        ? initialQueryClauses.map((clause) => ({ ...clause }))
        : [createDatabaseQueryClause()],
    );
    setReturnFields(initialReturnFields.length > 0 ? initialReturnFields : DEFAULT_RETURN_FIELDS);
    setReturnFieldsMenuOpen(false);
  }, [initialQueryClauses, initialReturnFields]);

  return (
    <form
      className="space-y-4"
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
      }}
    >
      <div className="rounded-[1.5rem] border border-[color:var(--theme-border)] bg-white/45 p-3.5">
        <div ref={queryListRef} className="max-h-[18rem] overflow-y-auto pr-1">
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
                      placeholder="Search term"
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
                    {STUDENT_QUERY_FIELD_OPTIONS.map((option) => (
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

        <div className="mt-3 flex justify-end border-t border-[rgba(220,205,166,0.5)] pt-3">
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

      <div className="relative rounded-[1.5rem] border border-[color:var(--theme-border)] bg-white/45 p-3.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="theme-text-muted type-label">Returned Fields</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setReturnFields(DEFAULT_RETURN_FIELDS)}
              className="theme-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-[color:var(--theme-text)] transition hover:scale-[1.02]"
            >
              Default view
            </button>
            <button
              type="button"
              onClick={() => setReturnFields(ALL_RETURN_FIELDS)}
              className="theme-card-muted inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold text-[color:var(--theme-text)] transition hover:scale-[1.02]"
            >
              Full database
            </button>
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
        </div>

        {returnFieldsMenuOpen ? (
          <div className="mt-3 rounded-[1.25rem] border border-[color:var(--theme-border)] bg-[color:rgba(252,248,234,0.98)] p-3 shadow-[0_20px_56px_rgba(37,79,34,0.16)] backdrop-blur-sm">
            <div className="max-h-64 grid grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {STUDENT_RETURN_FIELD_OPTIONS.map((option) => {
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

      <div className="flex items-center justify-end gap-2.5">
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
  );
}
