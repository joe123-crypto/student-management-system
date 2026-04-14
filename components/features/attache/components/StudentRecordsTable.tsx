import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { StudentProfile } from '@/types';
import type { StudentReturnField } from '@/components/features/attache/types';
import Checkbox from '@/components/ui/Checkbox';
import {
  STUDENT_FIELD_DEFINITION_MAP,
  STUDENT_FIELD_DEFINITIONS,
  getStudentFieldLabel,
  getStudentFieldValue,
} from '@/components/features/attache/utils/studentData';

interface StudentRecordsTableProps {
  students: StudentProfile[];
  isLoading?: boolean;
  returnFields: StudentReturnField[];
  selectedStudentIds: Set<string>;
  reviewedStudentIds: Set<string>;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (studentId: string, checked: boolean) => void;
  editingStudentId: string | null;
  onCancelEdit: () => void;
  onManage: (studentId: string) => void;
  onSaveEdit: (studentId: string, patch: Partial<StudentProfile>) => Promise<void>;
}

interface TableColumn {
  key: StudentReturnField;
  label: string;
}

type EditStudentDraft = Record<StudentReturnField, string>;
type SectionPatchMap = {
  student: Partial<StudentProfile['student']>;
  passport: Partial<StudentProfile['passport']>;
  contact: Partial<StudentProfile['contact']>;
  university: Partial<StudentProfile['university']>;
  program: Partial<StudentProfile['program']>;
  bank: Partial<StudentProfile['bank']>;
  bankAccount: Partial<StudentProfile['bankAccount']>;
  address: Partial<StudentProfile['address']>;
};

const FALLBACK_FIELDS: StudentReturnField[] = ['fullName', 'email'];
const inlineInputClass =
  'theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none';

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      givenName: '',
      familyName: '',
    };
  }

  return {
    givenName: parts[0],
    familyName: parts.slice(1).join(' '),
  };
}

function createEditDraft(student: StudentProfile): EditStudentDraft {
  return Object.fromEntries(
    STUDENT_FIELD_DEFINITIONS.map((definition) => [
      definition.key,
      getStudentFieldValue(student, definition.key),
    ]),
  ) as EditStudentDraft;
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

function getColumns(returnFields: StudentReturnField[]): TableColumn[] {
  const safeFields = returnFields.length > 0 ? returnFields : FALLBACK_FIELDS;
  return safeFields.map((field) => ({
    key: field,
    label: getStudentFieldLabel(field),
  }));
}

function normalizeDraftValue(field: StudentReturnField, value: string): string {
  const trimmed = value.trim();

  if (field === 'inscription') {
    return trimmed.toUpperCase();
  }

  if (field === 'email') {
    return trimmed.toLowerCase();
  }

  return trimmed;
}

function createEmptySectionPatches(): SectionPatchMap {
  return {
    student: {},
    passport: {},
    contact: {},
    university: {},
    program: {},
    bank: {},
    bankAccount: {},
    address: {},
  };
}

function getValidationError(
  draft: EditStudentDraft,
  student: StudentProfile,
  allStudents: StudentProfile[],
  visibleFields: StudentReturnField[],
): string {
  const visibleFieldSet = new Set(visibleFields);
  const normalizedFullName = draft.fullName.trim();
  const normalizedGivenName = draft.givenName.trim();
  const normalizedFamilyName = draft.familyName.trim();
  const normalizedInscription = normalizeDraftValue('inscription', draft.inscription);
  const normalizedEmail = normalizeDraftValue('email', draft.email);

  if (
    (visibleFieldSet.has('fullName') ||
      visibleFieldSet.has('givenName') ||
      visibleFieldSet.has('familyName')) &&
    !normalizedFullName &&
    !normalizedGivenName &&
    !normalizedFamilyName
  ) {
    return 'Student name is required.';
  }

  if (visibleFieldSet.has('inscription') && !normalizedInscription) {
    return 'Inscription number is required.';
  }

  if (
    visibleFieldSet.has('inscription') &&
    normalizedInscription &&
    allStudents.some(
      (entry) =>
        entry.id !== student.id &&
        entry.student.inscriptionNumber.trim().toUpperCase() === normalizedInscription,
    )
  ) {
    return 'Another student already uses that inscription number.';
  }

  if (
    visibleFieldSet.has('email') &&
    normalizedEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return 'Enter a valid email address.';
  }

  return '';
}

function buildStudentPatch(
  student: StudentProfile,
  draft: EditStudentDraft,
  visibleFields: StudentReturnField[],
): Partial<StudentProfile> {
  const visibleFieldSet = new Set(visibleFields);
  const sectionPatches = createEmptySectionPatches();
  const patch: Partial<StudentProfile> = {};

  for (const field of visibleFields) {
    if (field === 'status' || field === 'fullName' || field === 'givenName' || field === 'familyName') {
      continue;
    }

    const definition = STUDENT_FIELD_DEFINITION_MAP[field];
    if (!definition?.patchTarget) {
      continue;
    }

    sectionPatches[definition.patchTarget.section][definition.patchTarget.key as never] = normalizeDraftValue(
      field,
      draft[field],
    ) as never;
  }

  const normalizedFullName = draft.fullName.trim();
  const normalizedGivenName = draft.givenName.trim();
  const normalizedFamilyName = draft.familyName.trim();
  const splitFromFullName = splitFullName(normalizedFullName);
  const nameFieldsVisible =
    visibleFieldSet.has('fullName') ||
    visibleFieldSet.has('givenName') ||
    visibleFieldSet.has('familyName');

  if (visibleFieldSet.has('fullName')) {
    sectionPatches.student.fullName = normalizedFullName;
    if (!visibleFieldSet.has('givenName')) {
      sectionPatches.student.givenName = splitFromFullName.givenName;
    }
    if (!visibleFieldSet.has('familyName')) {
      sectionPatches.student.familyName = splitFromFullName.familyName;
    }
  }

  if (visibleFieldSet.has('givenName')) {
    sectionPatches.student.givenName = normalizedGivenName;
  }

  if (visibleFieldSet.has('familyName')) {
    sectionPatches.student.familyName = normalizedFamilyName;
  }

  if (!visibleFieldSet.has('fullName') && (visibleFieldSet.has('givenName') || visibleFieldSet.has('familyName'))) {
    const nextGivenName = visibleFieldSet.has('givenName')
      ? normalizedGivenName
      : student.student.givenName.trim();
    const nextFamilyName = visibleFieldSet.has('familyName')
      ? normalizedFamilyName
      : student.student.familyName.trim();
    sectionPatches.student.fullName = `${nextGivenName} ${nextFamilyName}`.trim();
  }

  if (visibleFieldSet.has('status')) {
    patch.status = draft.status as StudentProfile['status'];
  }

  const nextFullName =
    sectionPatches.student.fullName ||
    `${sectionPatches.student.givenName ?? student.student.givenName} ${sectionPatches.student.familyName ?? student.student.familyName}`.trim();

  if (
    nameFieldsVisible &&
    !visibleFieldSet.has('accountHolderName') &&
    student.bankAccount.accountHolderName.trim() === student.student.fullName.trim()
  ) {
    sectionPatches.bankAccount.accountHolderName = nextFullName;
  }

  if (Object.keys(sectionPatches.student).length > 0) {
    patch.student = sectionPatches.student as StudentProfile['student'];
  }
  if (Object.keys(sectionPatches.passport).length > 0) {
    patch.passport = sectionPatches.passport as StudentProfile['passport'];
  }
  if (Object.keys(sectionPatches.contact).length > 0) {
    patch.contact = sectionPatches.contact as StudentProfile['contact'];
  }
  if (Object.keys(sectionPatches.university).length > 0) {
    patch.university = sectionPatches.university as StudentProfile['university'];
  }
  if (Object.keys(sectionPatches.program).length > 0) {
    patch.program = sectionPatches.program as StudentProfile['program'];
  }
  if (Object.keys(sectionPatches.bank).length > 0) {
    patch.bank = sectionPatches.bank as StudentProfile['bank'];
  }
  if (Object.keys(sectionPatches.bankAccount).length > 0) {
    patch.bankAccount = sectionPatches.bankAccount as StudentProfile['bankAccount'];
  }
  if (Object.keys(sectionPatches.address).length > 0) {
    patch.address = sectionPatches.address as StudentProfile['address'];
  }

  return patch;
}

function isMonospaceField(field: StudentReturnField): boolean {
  return [
    'inscription',
    'registrationNumber',
    'passportNumber',
    'branchCode',
    'accountNumber',
    'iban',
    'swiftCode',
    'countryCode',
  ].includes(field);
}

function renderReadOnlyCell(student: StudentProfile, field: StudentReturnField) {
  if (field === 'status') {
    return (
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
          student.status,
        )}`}
      >
        {student.status}
      </span>
    );
  }

  const value = getStudentFieldValue(student, field);
  if (!value) {
    return <span className="theme-text-muted text-sm">Not provided</span>;
  }

  const baseClassName = isMonospaceField(field)
    ? 'text-sm font-mono text-[color:var(--theme-primary-soft)]'
    : field === 'fullName'
      ? 'theme-heading text-sm font-semibold'
      : 'theme-text-muted text-sm';

  return <span className={baseClassName}>{value}</span>;
}

function EditableCell({
  field,
  draft,
  onFieldChange,
}: {
  field: StudentReturnField;
  draft: EditStudentDraft;
  onFieldChange: (field: StudentReturnField, value: string) => void;
}) {
  const definition = STUDENT_FIELD_DEFINITION_MAP[field];

  if (definition.inputType === 'select') {
    return (
      <select
        className={inlineInputClass}
        value={draft[field]}
        onChange={(event) => onFieldChange(field, event.target.value)}
      >
        {(definition.options || []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={definition.inputType || 'text'}
      className={`${inlineInputClass} ${isMonospaceField(field) ? 'font-mono' : ''}`}
      value={draft[field]}
      onChange={(event) => onFieldChange(field, event.target.value)}
    />
  );
}

export default function StudentRecordsTable({
  students,
  isLoading = false,
  returnFields,
  selectedStudentIds,
  reviewedStudentIds,
  onToggleSelectAll,
  onToggleSelectOne,
  editingStudentId,
  onCancelEdit,
  onManage,
  onSaveEdit,
}: StudentRecordsTableProps) {
  const [draft, setDraft] = useState<EditStudentDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const allSelected =
    students.length > 0 && students.every((student) => selectedStudentIds.has(student.id));
  const columns = getColumns(returnFields);
  const safeFields = useMemo<StudentReturnField[]>(
    () => (returnFields.length > 0 ? returnFields : FALLBACK_FIELDS),
    [returnFields],
  );
  const isInlineEditing = editingStudentId !== null;
  const tableMinWidth = useMemo(
    () => Math.max(760, 72 + columns.length * 170),
    [columns.length],
  );

  useEffect(() => {
    if (!editingStudentId) {
      setDraft(null);
      setIsSaving(false);
      setSaveError('');
      return;
    }

    const student = students.find((entry) => entry.id === editingStudentId);
    if (!student) {
      setDraft(null);
      setIsSaving(false);
      setSaveError('');
      return;
    }

    setDraft(createEditDraft(student));
    setIsSaving(false);
    setSaveError('');
  }, [editingStudentId, students]);

  const updateDraftField = (field: StudentReturnField, value: string) => {
    setSaveError('');
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  };

  const handleSave = async (student: StudentProfile) => {
    if (!draft || isSaving) {
      return;
    }

    const validationError = getValidationError(draft, student, students, safeFields);
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      await onSaveEdit(student.id, buildStudentPatch(student, draft, safeFields));
    } catch (error) {
      console.error('[STUDENTS] Failed to save inline student edit:', error);
      setSaveError(
        error instanceof Error
          ? error.message
          : 'We could not save this student record. Please try again.',
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="theme-card overflow-hidden rounded-[1.75rem] border">
      {isLoading ? (
        <div className="h-[400px] overflow-auto animate-pulse">
          <div className="theme-table-header sticky top-0 z-10 border-b">
            <div className="grid grid-cols-[56px_repeat(4,minmax(0,1fr))] gap-4 px-4 py-4">
              <div className="h-4 w-4 rounded bg-[rgba(220,205,166,0.6)]" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-3 w-28 rounded bg-[rgba(220,205,166,0.6)]" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-[rgba(220,205,166,0.55)]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[56px_repeat(4,minmax(0,1fr))] gap-4 px-4 py-4"
              >
                <div className="mt-1 h-4 w-4 rounded bg-[rgba(220,205,166,0.6)]" />
                {Array.from({ length: 4 }).map((__, columnIndex) => (
                  <div key={columnIndex} className="space-y-2">
                    <div className="h-3 w-36 rounded bg-[rgba(220,205,166,0.6)]" />
                    <div className="h-3 w-24 rounded bg-[rgba(220,205,166,0.34)]" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[400px] overflow-auto">
          <div className="theme-table-header border-b px-4 py-3 md:hidden">
            <label className="theme-text-muted inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
              Select all
            </label>
          </div>

          <div className="divide-y divide-[rgba(220,205,166,0.55)] md:hidden">
            {students.map((student) => {
              const isSelected = selectedStudentIds.has(student.id);
              const isReviewed = reviewedStudentIds.has(student.id);
              const isEditing = editingStudentId === student.id && draft !== null;

              return (
                <article
                  key={student.id}
                  className={`space-y-3 p-4 transition-colors hover:bg-[rgba(237,228,194,0.38)] ${
                    isEditing
                      ? 'bg-[rgba(236,220,180,0.3)]'
                      : 'bg-[rgba(255,255,255,0.24)]'
                  } ${isInlineEditing ? '' : 'cursor-pointer'} ${
                    isSelected ? 'ring-1 ring-[rgba(160,58,19,0.08)] ring-inset' : ''
                  }`}
                  onClick={() => {
                    if (!isInlineEditing) {
                      onManage(student.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="theme-text-muted type-label">
                      {isReviewed ? 'Reviewed record' : 'Record'}
                    </div>
                    <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleSave(student)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--theme-primary)] text-white transition hover:bg-[color:var(--theme-primary-strong)] disabled:opacity-60"
                            aria-label={`Save ${student.student.fullName}`}
                            disabled={isSaving}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={onCancelEdit}
                            className="theme-card-muted inline-flex h-9 w-9 items-center justify-center rounded-xl border text-[color:var(--theme-danger)] transition hover:bg-[rgba(183,76,45,0.08)]"
                            aria-label={`Cancel editing ${student.student.fullName}`}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : null}
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => onToggleSelectOne(student.id, e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm" onClick={(event) => isEditing && event.stopPropagation()}>
                    {columns.map((column) => (
                      <div key={column.key}>
                        <p className="theme-text-muted type-label mb-1">{column.label}</p>
                        <div>
                          {isEditing && draft ? (
                            <EditableCell
                              field={column.key}
                              draft={draft}
                              onFieldChange={updateDraftField}
                            />
                          ) : (
                            renderReadOnlyCell(student, column.key)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isEditing && saveError ? (
                    <div className="theme-danger rounded-2xl border px-3 py-2 text-sm font-medium">
                      {saveError}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <table className="hidden w-full text-left md:table" style={{ minWidth: `${tableMinWidth}px` }}>
            <thead className="sticky top-0 z-10">
              <tr className="theme-table-header theme-text-muted type-label shadow-[inset_0_-1px_0_rgba(220,205,166,0.65)]">
                <th className="px-4 py-4">
                  <Checkbox checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
                </th>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-4">
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-right">
                  <span className="sr-only">Row actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(220,205,166,0.55)]">
              {students.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const isReviewed = reviewedStudentIds.has(student.id);
                const isEditing = editingStudentId === student.id && draft !== null;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors odd:bg-[rgba(255,255,255,0.22)] even:bg-[rgba(237,228,194,0.14)] hover:bg-[rgba(237,228,194,0.38)] ${
                      isEditing
                        ? 'bg-[rgba(236,220,180,0.3)]'
                        : ''
                    } ${isInlineEditing ? '' : 'cursor-pointer'} ${
                      isSelected ? 'bg-[rgba(255,250,242,0.8)]' : ''
                    }`}
                    onClick={() => {
                      if (!isInlineEditing) {
                        onManage(student.id);
                      }
                    }}
                  >
                    <td className="px-4 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => onToggleSelectOne(student.id, e.target.checked)}
                      />
                    </td>
                    {columns.map((column, index) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 align-top"
                        onClick={(event) => isEditing && event.stopPropagation()}
                      >
                        {isEditing && draft ? (
                          <EditableCell
                            field={column.key}
                            draft={draft}
                            onFieldChange={updateDraftField}
                          />
                        ) : (
                          <div className="flex items-start gap-2">
                            {index === 0 && isReviewed ? (
                              <span className="theme-success type-label rounded-full px-2 py-1">
                                Reviewed
                              </span>
                            ) : null}
                            <div>{renderReadOnlyCell(student, column.key)}</div>
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right align-top" onClick={(event) => event.stopPropagation()}>
                      {isEditing ? (
                        <div className="flex items-start justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSave(student)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--theme-primary)] text-white transition hover:bg-[color:var(--theme-primary-strong)] disabled:opacity-60"
                            aria-label={`Save ${student.student.fullName}`}
                            disabled={isSaving}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={onCancelEdit}
                            className="theme-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[color:var(--theme-danger)] transition hover:bg-[rgba(183,76,45,0.08)]"
                            aria-label={`Cancel editing ${student.student.fullName}`}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                      {isEditing && saveError ? (
                        <p className="theme-danger mt-2 rounded-xl border px-3 py-2 text-left text-xs font-medium">
                          {saveError}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && students.length === 0 ? (
        <div className="p-12 text-center">
          <p className="theme-text-muted">No students found matching your filters.</p>
        </div>
      ) : null}
    </div>
  );
}
