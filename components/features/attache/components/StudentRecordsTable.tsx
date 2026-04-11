import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { StudentProfile } from '@/types';
import type { StudentReturnField } from '@/components/features/attache/types';
import Checkbox from '@/components/ui/Checkbox';

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
  render: (student: StudentProfile) => React.ReactNode;
}

interface EditStudentDraft {
  fullName: string;
  inscriptionNumber: string;
  email: string;
  phone: string;
  status: StudentProfile['status'];
  universityName: string;
  campus: string;
  city: string;
  programMajor: string;
  degreeLevel: string;
}

const inlineInputClass =
  'theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none';

const inlineSelectClass =
  'theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none';

function createEditDraft(student: StudentProfile): EditStudentDraft {
  return {
    fullName: student.student.fullName || '',
    inscriptionNumber: student.student.inscriptionNumber || '',
    email: student.contact.email || '',
    phone: student.contact.phone || '',
    status: student.status,
    universityName: student.university.universityName || '',
    campus: student.university.campus || '',
    city: student.university.city || '',
    programMajor: student.program.major || '',
    degreeLevel: student.program.degreeLevel || '',
  };
}

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
  const baseColumns: Record<StudentReturnField, TableColumn> = {
    fullName: {
      key: 'fullName',
      label: 'Full Name',
      render: (student) => (
        <div>
          <div className="theme-heading text-sm font-bold">{student.student.fullName}</div>
          <div className="theme-text-muted text-xs">{student.contact.email}</div>
        </div>
      ),
    },
    inscription: {
      key: 'inscription',
      label: 'Inscription No.',
      render: (student) => (
        <span className="text-sm font-mono text-[color:var(--theme-primary-soft)]">
          {student.student.inscriptionNumber}
        </span>
      ),
    },
    email: {
      key: 'email',
      label: 'Email',
      render: (student) => <span className="theme-text-muted text-sm">{student.contact.email}</span>,
    },
    university: {
      key: 'university',
      label: 'University',
      render: (student) => (
        <div>
          <div className="theme-heading text-sm font-medium">{student.university.universityName}</div>
          <div className="theme-text-muted text-xs">
            {[student.university.campus, student.university.city].filter(Boolean).join(' · ')}
          </div>
        </div>
      ),
    },
    program: {
      key: 'program',
      label: 'Program',
      render: (student) => (
        <div>
          <div className="theme-heading text-sm font-medium">{student.program.major}</div>
          <div className="theme-text-muted text-xs">{student.program.degreeLevel}</div>
        </div>
      ),
    },
    degreeLevel: {
      key: 'degreeLevel',
      label: 'Degree Level',
      render: (student) => <span className="theme-text-muted text-sm">{student.program.degreeLevel}</span>,
    },
    status: {
      key: 'status',
      label: 'Status',
      render: (student) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(student.status)}`}
        >
          {student.status}
        </span>
      ),
    },
    phone: {
      key: 'phone',
      label: 'Phone',
      render: (student) => (
        <span className="theme-text-muted text-sm">{student.contact.phone || 'Not provided'}</span>
      ),
    },
  };

  const safeFields = returnFields.length > 0 ? returnFields : ['fullName', 'email'];
  return safeFields.map((field) => baseColumns[field]);
}

function getValidationError(
  draft: EditStudentDraft,
  student: StudentProfile,
  allStudents: StudentProfile[],
  visibleFields: StudentReturnField[],
): string {
  const visibleFieldSet = new Set(visibleFields);
  const normalizedFullName = draft.fullName.trim();
  const normalizedInscription = draft.inscriptionNumber.trim().toUpperCase();
  const normalizedEmail = draft.email.trim().toLowerCase();

  if (visibleFieldSet.has('fullName') && !normalizedFullName) {
    return 'Full name is required.';
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

  if (visibleFieldSet.has('email') && normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
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
  const studentPatch: Partial<StudentProfile['student']> = {};
  const contactPatch: Partial<StudentProfile['contact']> = {};
  const universityPatch: Partial<StudentProfile['university']> = {};
  const programPatch: Partial<StudentProfile['program']> = {};
  const bankAccountPatch: Partial<StudentProfile['bankAccount']> = {};
  const normalizedFullName = draft.fullName.trim();
  const normalizedInscription = draft.inscriptionNumber.trim().toUpperCase();
  const normalizedEmail = draft.email.trim().toLowerCase();
  const normalizedPhone = draft.phone.trim();
  const normalizedUniversityName = draft.universityName.trim();
  const normalizedCampus = draft.campus.trim();
  const normalizedCity = draft.city.trim();
  const normalizedProgramMajor = draft.programMajor.trim();
  const normalizedDegreeLevel = draft.degreeLevel.trim();
  const { givenName, familyName } = splitFullName(normalizedFullName);

  if (visibleFieldSet.has('fullName')) {
    studentPatch.fullName = normalizedFullName;
    studentPatch.givenName = givenName;
    studentPatch.familyName = familyName;
  }

  if (visibleFieldSet.has('inscription')) {
    studentPatch.inscriptionNumber = normalizedInscription;
  }

  if (visibleFieldSet.has('email')) {
    contactPatch.email = normalizedEmail;
  }

  if (visibleFieldSet.has('phone')) {
    contactPatch.phone = normalizedPhone;
  }

  if (visibleFieldSet.has('university')) {
    universityPatch.universityName = normalizedUniversityName;
    universityPatch.campus = normalizedCampus;
    universityPatch.city = normalizedCity;
  }

  if (visibleFieldSet.has('program')) {
    programPatch.major = normalizedProgramMajor;
    if (!visibleFieldSet.has('degreeLevel')) {
      programPatch.degreeLevel = normalizedDegreeLevel;
    }
  }

  if (visibleFieldSet.has('degreeLevel')) {
    programPatch.degreeLevel = normalizedDegreeLevel;
  }

  if (
    visibleFieldSet.has('fullName') &&
    student.bankAccount.accountHolderName.trim() === student.student.fullName.trim()
  ) {
    bankAccountPatch.accountHolderName = normalizedFullName;
  }

  const patch: Partial<StudentProfile> = {};

  if (Object.keys(studentPatch).length > 0) {
    patch.student = studentPatch as StudentProfile['student'];
  }

  if (Object.keys(contactPatch).length > 0) {
    patch.contact = contactPatch as StudentProfile['contact'];
  }

  if (Object.keys(universityPatch).length > 0) {
    patch.university = universityPatch as StudentProfile['university'];
  }

  if (Object.keys(programPatch).length > 0) {
    patch.program = programPatch as StudentProfile['program'];
  }

  if (Object.keys(bankAccountPatch).length > 0) {
    patch.bankAccount = bankAccountPatch as StudentProfile['bankAccount'];
  }

  if (visibleFieldSet.has('status')) {
    patch.status = draft.status;
  }

  return patch;
}

function EditableCell({
  column,
  draft,
  onFieldChange,
  showDegreeLevelInProgram,
}: {
  column: StudentReturnField;
  draft: EditStudentDraft;
  onFieldChange: (field: keyof EditStudentDraft, value: string) => void;
  showDegreeLevelInProgram: boolean;
}) {
  switch (column) {
    case 'fullName':
      return (
        <input
          type="text"
          className={inlineInputClass}
          value={draft.fullName}
          onChange={(event) => onFieldChange('fullName', event.target.value)}
        />
      );
    case 'inscription':
      return (
        <input
          type="text"
          className={`${inlineInputClass} font-mono`}
          value={draft.inscriptionNumber}
          onChange={(event) => onFieldChange('inscriptionNumber', event.target.value)}
        />
      );
    case 'email':
      return (
        <input
          type="email"
          className={inlineInputClass}
          value={draft.email}
          onChange={(event) => onFieldChange('email', event.target.value)}
        />
      );
    case 'university':
      return (
        <div className="space-y-2">
          <input
            type="text"
            className={inlineInputClass}
            value={draft.universityName}
            onChange={(event) => onFieldChange('universityName', event.target.value)}
            placeholder="University name"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              className={inlineInputClass}
              value={draft.campus}
              onChange={(event) => onFieldChange('campus', event.target.value)}
              placeholder="Campus"
            />
            <input
              type="text"
              className={inlineInputClass}
              value={draft.city}
              onChange={(event) => onFieldChange('city', event.target.value)}
              placeholder="City"
            />
          </div>
        </div>
      );
    case 'program':
      return (
        <div className="space-y-2">
          <input
            type="text"
            className={inlineInputClass}
            value={draft.programMajor}
            onChange={(event) => onFieldChange('programMajor', event.target.value)}
            placeholder="Program"
          />
          {showDegreeLevelInProgram ? (
            <input
              type="text"
              className={inlineInputClass}
              value={draft.degreeLevel}
              onChange={(event) => onFieldChange('degreeLevel', event.target.value)}
              placeholder="Degree level"
            />
          ) : null}
        </div>
      );
    case 'degreeLevel':
      return (
        <input
          type="text"
          className={inlineInputClass}
          value={draft.degreeLevel}
          onChange={(event) => onFieldChange('degreeLevel', event.target.value)}
        />
      );
    case 'status':
      return (
        <select
          className={inlineSelectClass}
          value={draft.status}
          onChange={(event) => onFieldChange('status', event.target.value as StudentProfile['status'])}
        >
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>
      );
    case 'phone':
      return (
        <input
          type="text"
          className={inlineInputClass}
          value={draft.phone}
          onChange={(event) => onFieldChange('phone', event.target.value)}
        />
      );
    default:
      return null;
  }
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
    () => (returnFields.length > 0 ? returnFields : ['fullName', 'email']),
    [returnFields],
  );
  const showDegreeLevelInProgram = safeFields.includes('program') && !safeFields.includes('degreeLevel');
  const isInlineEditing = editingStudentId !== null;

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

  const updateDraftField = (field: keyof EditStudentDraft, value: string) => {
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
    <div className="theme-card overflow-hidden rounded-2xl border">
      {isLoading ? (
        <div className="h-[400px] overflow-auto animate-pulse">
          <div className="theme-card-muted sticky top-0 z-10 border-b">
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
          <div className="theme-card-muted border-b px-4 py-3 md:hidden">
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
                  className={`space-y-3 p-4 transition-colors hover:bg-[rgba(237,228,194,0.22)] ${
                    isEditing ? 'bg-[rgba(237,228,194,0.18)]' : isInlineEditing ? '' : 'cursor-pointer'
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
                              column={column.key}
                              draft={draft}
                              onFieldChange={updateDraftField}
                              showDegreeLevelInProgram={showDegreeLevelInProgram}
                            />
                          ) : (
                            column.render(student)
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

          <table className="hidden w-full min-w-[760px] text-left md:table">
            <thead className="sticky top-0 z-10">
              <tr className="theme-card-muted theme-text-muted type-label">
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
                    className={`transition-colors hover:bg-[rgba(237,228,194,0.22)] ${
                      isEditing ? 'bg-[rgba(237,228,194,0.18)]' : isInlineEditing ? '' : 'cursor-pointer'
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
                            column={column.key}
                            draft={draft}
                            onFieldChange={updateDraftField}
                            showDegreeLevelInProgram={showDegreeLevelInProgram}
                          />
                        ) : (
                          <div className="flex items-start gap-2">
                            {index === 0 && isReviewed ? (
                              <span className="theme-success type-label rounded-full px-2 py-1">
                                Reviewed
                              </span>
                            ) : null}
                            <div>{column.render(student)}</div>
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
