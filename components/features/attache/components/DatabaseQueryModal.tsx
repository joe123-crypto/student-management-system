'use client';

import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Database, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { StudentProfile } from '@/types';

type QueryField = 'all' | 'fullName' | 'inscription' | 'email' | 'university' | 'program';
type QueryStatus = 'ALL' | StudentProfile['status'];

interface DatabaseQueryModalProps {
  open: boolean;
  students: StudentProfile[];
  onClose: () => void;
  onOpenStudent: (studentId: string) => void;
}

const QUERY_FIELD_OPTIONS: Array<{ value: QueryField; label: string }> = [
  { value: 'all', label: 'All fields' },
  { value: 'fullName', label: 'Student name' },
  { value: 'inscription', label: 'Inscription no.' },
  { value: 'email', label: 'Email' },
  { value: 'university', label: 'University' },
  { value: 'program', label: 'Program' },
];

const STATUS_OPTIONS: Array<{ value: QueryStatus; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function getFieldValue(student: StudentProfile, field: QueryField): string[] {
  const fieldMap: Record<Exclude<QueryField, 'all'>, string[]> = {
    fullName: [student.student.fullName],
    inscription: [student.student.inscriptionNumber],
    email: [student.contact.email],
    university: [student.university.universityName],
    program: [student.program.major, student.program.degreeLevel],
  };

  if (field === 'all') {
    return [
      student.student.fullName,
      student.student.inscriptionNumber,
      student.contact.email,
      student.university.universityName,
      student.program.major,
      student.program.degreeLevel,
      student.contact.phone,
    ];
  }

  return fieldMap[field];
}

function getStatusClasses(status: StudentProfile['status']): string {
  if (status === 'ACTIVE') {
    return 'theme-chip-success';
  }

  if (status === 'COMPLETED') {
    return 'theme-chip-warm';
  }

  return 'theme-chip-muted';
}

export default function DatabaseQueryModal({
  open,
  students,
  onClose,
  onOpenStudent,
}: DatabaseQueryModalProps) {
  const [searchText, setSearchText] = useState('');
  const [queryField, setQueryField] = useState<QueryField>('all');
  const [statusFilter, setStatusFilter] = useState<QueryStatus>('ALL');
  const deferredSearchText = useDeferredValue(searchText);

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

  const matches = useMemo(() => {
    const normalizedQuery = normalize(deferredSearchText);

    return students.filter((student) => {
      if (statusFilter !== 'ALL' && student.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return getFieldValue(student, queryField).some((value) => normalize(value).includes(normalizedQuery));
    });
  }, [deferredSearchText, queryField, statusFilter, students]);

  const previewMatches = matches.slice(0, 10);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="theme-overlay absolute inset-0" onClick={onClose} />

      <div className="theme-panel-glass relative z-10 w-full max-w-5xl rounded-[2rem] border p-6 shadow-xl md:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="theme-icon-well inline-flex h-12 w-12 items-center justify-center rounded-2xl border">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="theme-heading text-xl font-bold">Query Student Database</h3>
              <p className="theme-text-muted mt-1 max-w-2xl text-sm">
                Search the attache student records by name, inscription number, email, university, or program.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="theme-card-muted inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition hover:scale-[1.02]"
            aria-label="Close database query popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-[color:var(--theme-border)] bg-white/45 p-4 md:grid-cols-[minmax(0,1.5fr)_13rem_13rem]">
          <label className="block">
            <span className="theme-text-muted type-label mb-2 block">Search terms</span>
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Try Seed Student, STUDENT123, computer science..."
                className="theme-input h-12 w-full rounded-2xl border pl-11 pr-4 text-sm outline-none"
              />
              <Search className="theme-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
            </div>
          </label>

          <label className="block">
            <span className="theme-text-muted type-label mb-2 block">Search field</span>
            <select
              value={queryField}
              onChange={(event) => setQueryField(event.target.value as QueryField)}
              className="theme-input h-12 w-full rounded-2xl border px-4 text-sm outline-none"
            >
              {QUERY_FIELD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="theme-text-muted type-label mb-2 block">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as QueryStatus)}
              className="theme-input h-12 w-full rounded-2xl border px-4 text-sm outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--theme-border)] bg-white/35 px-4 py-3">
          <p className="theme-text-muted text-sm">
            {matches.length} {matches.length === 1 ? 'record matches' : 'records match'} your query.
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchText('');
              setQueryField('all');
              setStatusFilter('ALL');
            }}
          >
            Reset query
          </Button>
        </div>

        <div className="mt-5 max-h-[52vh] space-y-3 overflow-y-auto pr-1">
          {previewMatches.length > 0 ? (
            previewMatches.map((student) => (
              <div
                key={student.id}
                className="theme-card rounded-[1.5rem] border p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="theme-heading text-base font-bold">{student.student.fullName}</h4>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <p className="theme-text-muted">
                        <span className="font-semibold">Inscription:</span> {student.student.inscriptionNumber}
                      </p>
                      <p className="theme-text-muted">
                        <span className="font-semibold">Email:</span> {student.contact.email}
                      </p>
                      <p className="theme-text-muted">
                        <span className="font-semibold">University:</span> {student.university.universityName}
                      </p>
                      <p className="theme-text-muted">
                        <span className="font-semibold">Program:</span> {student.program.major}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="min-w-32"
                    onClick={() => onOpenStudent(student.id)}
                  >
                    Open record
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="theme-card-muted rounded-[1.75rem] border border-dashed p-8 text-center">
              <h4 className="theme-heading text-base font-bold">No matches found</h4>
              <p className="theme-text-muted mt-2 text-sm">
                Try a different keyword, widen the search field, or switch the status filter back to all statuses.
              </p>
            </div>
          )}
        </div>

        {matches.length > previewMatches.length ? (
          <p className="theme-text-muted mt-4 text-xs">
            Showing the first {previewMatches.length} results. Refine the query to narrow the list further.
          </p>
        ) : null}
      </div>
    </div>
  );
}
