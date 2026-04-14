'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import type { ProgressDetails, StudentProfile } from '@/types';
import { inputClass } from '@/components/features/onboarding/components/styles';
import Notice from '@/components/ui/Notice';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { normalizeStudentProfile } from '@/lib/students/profile';

interface EditStudentRecordModalProps {
  open: boolean;
  student: StudentProfile;
  students: StudentProfile[];
  onClose: () => void;
  onSubmit: (student: StudentProfile) => Promise<void>;
  mode?: 'modal' | 'inline';
}

type EditableSection =
  | 'student'
  | 'passport'
  | 'university'
  | 'program'
  | 'bank'
  | 'bankAccount'
  | 'contact'
  | 'address';

type ValidationIssue = {
  message: string;
};

const academicStatusOptions = ['PENDING', 'ACTIVE', 'COMPLETED'];

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('aria-hidden') && element.getClientRects().length > 0);
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      givenName: parts[0] || '',
      familyName: '',
    };
  }

  return {
    givenName: parts[0],
    familyName: parts.slice(1).join(' '),
  };
}

function createProgressDraft(existing?: ProgressDetails, index = 0): ProgressDetails {
  return {
    id: existing?.id || `progress-draft-${Date.now()}-${index}`,
    date: existing?.date || '',
    year: existing?.year || '',
    level: existing?.level || '',
    grade: existing?.grade || '',
    status: existing?.status || 'PENDING',
    proofDocument: existing?.proofDocument,
  };
}

function cloneStudentProfile(student: StudentProfile): StudentProfile {
  return {
    ...student,
    student: { ...student.student },
    passport: { ...student.passport },
    university: { ...student.university },
    program: { ...student.program },
    bank: { ...student.bank },
    bankAccount: { ...student.bankAccount },
    contact: { ...student.contact },
    address: { ...student.address },
    academicHistory: (student.academicHistory || []).map((entry, index) => createProgressDraft(entry, index)),
  };
}

function prepareStudentForSave(draft: StudentProfile): StudentProfile {
  const fullName = draft.student.fullName.trim();
  const derivedNames = splitFullName(fullName);

  return normalizeStudentProfile({
    ...draft,
    student: {
      ...draft.student,
      fullName,
      givenName: draft.student.givenName.trim() || derivedNames.givenName,
      familyName: draft.student.familyName.trim() || derivedNames.familyName,
      inscriptionNumber: draft.student.inscriptionNumber.trim().toUpperCase(),
      registrationNumber: draft.student.registrationNumber?.trim() || '',
      nationality: draft.student.nationality.trim(),
      dateOfBirth: draft.student.dateOfBirth.trim(),
      profilePicture: draft.student.profilePicture?.trim() || undefined,
    },
    passport: {
      ...draft.passport,
      passportNumber: draft.passport.passportNumber.trim(),
      issueDate: draft.passport.issueDate.trim(),
      expiryDate: draft.passport.expiryDate.trim(),
      issuingCountry: draft.passport.issuingCountry.trim(),
    },
    university: {
      ...draft.university,
      universityName: draft.university.universityName.trim(),
      acronym: draft.university.acronym.trim(),
      campus: draft.university.campus.trim(),
      city: draft.university.city.trim(),
      department: draft.university.department?.trim() || '',
    },
    program: {
      ...draft.program,
      degreeLevel: draft.program.degreeLevel.trim(),
      major: draft.program.major.trim(),
      startDate: draft.program.startDate.trim(),
      expectedEndDate: draft.program.expectedEndDate.trim(),
      programType: draft.program.programType?.trim() || '',
    },
    bank: {
      ...draft.bank,
      bankName: draft.bank.bankName.trim(),
      branchName: draft.bank.branchName.trim(),
      branchAddress: draft.bank.branchAddress.trim(),
      branchCode: draft.bank.branchCode.trim(),
    },
    bankAccount: {
      ...draft.bankAccount,
      accountHolderName: draft.bankAccount.accountHolderName.trim() || fullName,
      accountNumber: draft.bankAccount.accountNumber.trim(),
      iban: draft.bankAccount.iban.trim(),
      swiftCode: draft.bankAccount.swiftCode.trim(),
      dateCreated: draft.bankAccount.dateCreated?.trim() || '',
    },
    contact: {
      ...draft.contact,
      email: draft.contact.email.trim().toLowerCase(),
      phone: draft.contact.phone.trim(),
      emergencyContactName: draft.contact.emergencyContactName.trim(),
      emergencyContactPhone: draft.contact.emergencyContactPhone.trim(),
    },
    address: {
      ...draft.address,
      homeCountryAddress: draft.address.homeCountryAddress.trim(),
      currentHostAddress: draft.address.currentHostAddress.trim(),
      street: draft.address.street?.trim() || '',
      city: draft.address.city?.trim() || '',
      state: draft.address.state?.trim() || '',
      countryCode: draft.address.countryCode?.trim() || '',
      wilaya: draft.address.wilaya?.trim() || '',
    },
    academicHistory: (draft.academicHistory || [])
      .map((entry, index) => ({
        ...entry,
        id: entry.id || `progress-draft-${Date.now()}-${index}`,
        date: entry.date.trim(),
        year: entry.year.trim(),
        level: entry.level.trim(),
        grade: entry.grade.trim(),
        status: entry.status.trim() || 'PENDING',
        proofDocument: entry.proofDocument?.trim() || undefined,
      }))
      .filter((entry) => [entry.date, entry.year, entry.level, entry.grade, entry.status].some(Boolean)),
  });
}

function validateStudentDraft(nextStudent: StudentProfile, students: StudentProfile[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const inscriptionNumber = nextStudent.student.inscriptionNumber.trim().toUpperCase();
  const email = nextStudent.contact.email.trim().toLowerCase();

  if (!inscriptionNumber) {
    issues.push({ message: 'Inscription number is required.' });
  }

  if (!nextStudent.student.fullName.trim() && !nextStudent.student.givenName.trim() && !nextStudent.student.familyName.trim()) {
    issues.push({ message: 'Add at least a full name or given and family names.' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    issues.push({ message: 'Enter a valid email address.' });
  }

  if (
    inscriptionNumber &&
    students.some(
      (existingStudent) =>
        existingStudent.id !== nextStudent.id &&
        existingStudent.student.inscriptionNumber.trim().toUpperCase() === inscriptionNumber,
    )
  ) {
    issues.push({ message: 'A student with this inscription number already exists.' });
  }

  if (
    email &&
    students.some(
      (existingStudent) =>
        existingStudent.id !== nextStudent.id &&
        existingStudent.contact.email.trim().toLowerCase() === email,
    )
  ) {
    issues.push({ message: 'A student with this email already exists.' });
  }

  (nextStudent.academicHistory || []).forEach((entry, index) => {
    const hasAnyValue = [entry.date, entry.year, entry.level, entry.grade, entry.status].some((value) => value.trim());
    const hasRequiredValues = entry.year.trim() && entry.level.trim() && entry.grade.trim();

    if (hasAnyValue && !hasRequiredValues) {
      issues.push({
        message: `Academic record ${index + 1} needs year, level, and grade before it can be saved.`,
      });
    }
  });

  return issues;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="theme-card rounded-[2rem] border p-5 md:p-6">
      <div className="mb-5">
        <h3 className="theme-heading type-card-title">{title}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export default function EditStudentRecordModal({
  open,
  student,
  students,
  onClose,
  onSubmit,
  mode = 'modal',
}: EditStudentRecordModalProps) {
  const [draft, setDraft] = useState<StudentProfile>(() => cloneStudentProfile(student));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const isModal = mode === 'modal';

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft(cloneStudentProfile(student));
    setIsSubmitting(false);
    setSubmitError('');
  }, [open, student]);

  useEffect(() => {
    if (!open || !isModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const modal = modalRef.current;
      if (!modal) {
        return;
      }

      const focusableElements = getFocusableElements(modal);
      if (focusableElements.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const focusIsInsideModal = Boolean(activeElement && modal.contains(activeElement));

      if (event.shiftKey) {
        if (!focusIsInsideModal || activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (!focusIsInsideModal || activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModal, isSubmitting, onClose, open]);

  const preparedStudent = useMemo(() => prepareStudentForSave(draft), [draft]);

  const updateNestedField = (section: EditableSection, field: string, value: string) => {
    setSubmitError('');
    setDraft((current) => {
      const currentSection = current[section];
      const nextDraft = {
        ...current,
        [section]: {
          ...currentSection,
          [field]: value,
        },
      } as StudentProfile;

      if (section === 'student' && field === 'fullName') {
        const currentHolderName = current.bankAccount.accountHolderName.trim();
        if (!currentHolderName || currentHolderName === current.student.fullName.trim()) {
          nextDraft.bankAccount = {
            ...nextDraft.bankAccount,
            accountHolderName: value,
          };
        }
      }

      if (section === 'student' && (field === 'givenName' || field === 'familyName')) {
        const givenName = field === 'givenName' ? value : current.student.givenName;
        const familyName = field === 'familyName' ? value : current.student.familyName;
        const nextFullName = `${givenName} ${familyName}`.trim();
        if (nextFullName) {
          nextDraft.student = {
            ...nextDraft.student,
            fullName: nextFullName,
          };
        }
      }

      return nextDraft;
    });
  };

  const updateProfileStatus = (value: StudentProfile['status']) => {
    setSubmitError('');
    setDraft((current) => ({
      ...current,
      status: value,
    }));
  };

  const updateAcademicHistoryField = (entryId: string, field: keyof ProgressDetails, value: string) => {
    setSubmitError('');
    setDraft((current) => ({
      ...current,
      academicHistory: (current.academicHistory || []).map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const addAcademicHistoryEntry = () => {
    setSubmitError('');
    setDraft((current) => ({
      ...current,
      academicHistory: [...(current.academicHistory || []), createProgressDraft(undefined, (current.academicHistory || []).length)],
    }));
  };

  const removeAcademicHistoryEntry = (entryId: string) => {
    setSubmitError('');
    setDraft((current) => ({
      ...current,
      academicHistory: (current.academicHistory || []).filter((entry) => entry.id !== entryId),
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const validationIssues = validateStudentDraft(preparedStudent, students);
    if (validationIssues.length > 0) {
      setSubmitError(validationIssues.map((issue) => issue.message).join(' '));
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(preparedStudent);
    } catch (error) {
      console.error('[STUDENTS] Failed to update student record:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'We could not update this student record. Please try again.',
      );
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  const editor = (
    <div
      ref={isModal ? modalRef : undefined}
      role={isModal ? 'dialog' : undefined}
      aria-modal={isModal ? true : undefined}
      aria-labelledby={isModal ? titleId : undefined}
      tabIndex={isModal ? -1 : undefined}
      className={
        isModal
          ? 'theme-panel-glass relative z-10 flex h-[min(54rem,calc(100vh-2rem))] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border p-6 shadow-xl md:p-8'
          : 'theme-panel-glass relative mx-auto w-full max-w-6xl rounded-[2rem] border p-6 shadow-xl md:p-8'
      }
    >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="theme-icon-well inline-flex h-11 w-11 items-center justify-center rounded-xl border">
              <Pencil className="h-5 w-5" />
            </div>
            <h2 id={titleId} className="theme-heading text-lg font-bold md:text-[1.7rem]">
              Edit Student Details
            </h2>
          </div>

          <button
            ref={isModal ? closeButtonRef : undefined}
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="theme-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
            aria-label={isModal ? 'Close edit student modal' : 'Close inline student editor'}
            disabled={isSubmitting}
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div
          className={
            isModal
              ? 'min-h-0 flex-1 overflow-y-auto pr-1'
              : 'max-h-[min(48rem,calc(100vh-10rem))] overflow-y-auto pr-1'
          }
        >
          {submitError ? (
            <Notice
              tone="error"
              title="Student record could not be updated"
              message={submitError}
              className="mb-6 rounded-3xl px-5 py-4"
            />
          ) : null}

          <div className="space-y-5">
            <SectionCard
              title="Personal identity"
            >
              <FormField label="Full name">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.student.fullName}
                  onChange={(event) => updateNestedField('student', 'fullName', event.target.value)}
                />
              </FormField>
              <FormField label="Inscription number">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.student.inscriptionNumber}
                  onChange={(event) => updateNestedField('student', 'inscriptionNumber', event.target.value)}
                />
              </FormField>
              <FormField label="Given name">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.student.givenName}
                  onChange={(event) => updateNestedField('student', 'givenName', event.target.value)}
                />
              </FormField>
              <FormField label="Family name">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.student.familyName}
                  onChange={(event) => updateNestedField('student', 'familyName', event.target.value)}
                />
              </FormField>
              <FormField label="Registration number">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.student.registrationNumber || ''}
                  onChange={(event) => updateNestedField('student', 'registrationNumber', event.target.value)}
                />
              </FormField>
              <FormField label="Status">
                <select
                  className={inputClass}
                  value={draft.status}
                  onChange={(event) => updateProfileStatus(event.target.value as StudentProfile['status'])}
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </FormField>
              <FormField label="Date of birth">
                <input
                  type="date"
                  className={inputClass}
                  value={draft.student.dateOfBirth}
                  onChange={(event) => updateNestedField('student', 'dateOfBirth', event.target.value)}
                />
              </FormField>
              <FormField label="Gender">
                <select
                  className={inputClass}
                  value={draft.student.gender}
                  onChange={(event) => updateNestedField('student', 'gender', event.target.value)}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>
              <FormField label="Nationality">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.student.nationality}
                  onChange={(event) => updateNestedField('student', 'nationality', event.target.value)}
                />
              </FormField>
            </SectionCard>

            <SectionCard
              title="Passport details"
            >
              <FormField label="Passport number">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.passport.passportNumber}
                  onChange={(event) => updateNestedField('passport', 'passportNumber', event.target.value)}
                />
              </FormField>
              <FormField label="Issuing country">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.passport.issuingCountry}
                  onChange={(event) => updateNestedField('passport', 'issuingCountry', event.target.value)}
                />
              </FormField>
              <FormField label="Issue date">
                <input
                  type="date"
                  className={inputClass}
                  value={draft.passport.issueDate}
                  onChange={(event) => updateNestedField('passport', 'issueDate', event.target.value)}
                />
              </FormField>
              <FormField label="Expiry date">
                <input
                  type="date"
                  className={inputClass}
                  value={draft.passport.expiryDate}
                  onChange={(event) => updateNestedField('passport', 'expiryDate', event.target.value)}
                />
              </FormField>
            </SectionCard>

            <SectionCard
              title="University and program"
            >
              <FormField label="University name">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.university.universityName}
                  onChange={(event) => updateNestedField('university', 'universityName', event.target.value)}
                />
              </FormField>
              <FormField label="University acronym">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.university.acronym}
                  onChange={(event) => updateNestedField('university', 'acronym', event.target.value)}
                />
              </FormField>
              <FormField label="Campus">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.university.campus}
                  onChange={(event) => updateNestedField('university', 'campus', event.target.value)}
                />
              </FormField>
              <FormField label="City">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.university.city}
                  onChange={(event) => updateNestedField('university', 'city', event.target.value)}
                />
              </FormField>
              <FormField label="Department">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.university.department || ''}
                  onChange={(event) => updateNestedField('university', 'department', event.target.value)}
                />
              </FormField>
              <FormField label="Program / major">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.program.major}
                  onChange={(event) => updateNestedField('program', 'major', event.target.value)}
                />
              </FormField>
              <FormField label="Degree level">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.program.degreeLevel}
                  onChange={(event) => updateNestedField('program', 'degreeLevel', event.target.value)}
                />
              </FormField>
              <FormField label="Program type">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.program.programType || ''}
                  onChange={(event) => updateNestedField('program', 'programType', event.target.value)}
                />
              </FormField>
              <FormField label="Start date">
                <input
                  type="date"
                  className={inputClass}
                  value={draft.program.startDate}
                  onChange={(event) => updateNestedField('program', 'startDate', event.target.value)}
                />
              </FormField>
              <FormField label="Expected end date">
                <input
                  type="date"
                  className={inputClass}
                  value={draft.program.expectedEndDate}
                  onChange={(event) => updateNestedField('program', 'expectedEndDate', event.target.value)}
                />
              </FormField>
            </SectionCard>

            <SectionCard
              title="Contact details"
            >
              <FormField label="Email address">
                <input
                  type="email"
                  className={inputClass}
                  value={draft.contact.email}
                  onChange={(event) => updateNestedField('contact', 'email', event.target.value)}
                />
              </FormField>
              <FormField label="Phone number">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.contact.phone}
                  onChange={(event) => updateNestedField('contact', 'phone', event.target.value)}
                />
              </FormField>
              <FormField label="Emergency contact name">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.contact.emergencyContactName}
                  onChange={(event) => updateNestedField('contact', 'emergencyContactName', event.target.value)}
                />
              </FormField>
              <FormField label="Emergency contact phone">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.contact.emergencyContactPhone}
                  onChange={(event) => updateNestedField('contact', 'emergencyContactPhone', event.target.value)}
                />
              </FormField>
            </SectionCard>

            <SectionCard
              title="Address details"
            >
              <FormField label="Current host address" className="md:col-span-2">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.address.currentHostAddress}
                  onChange={(event) => updateNestedField('address', 'currentHostAddress', event.target.value)}
                />
              </FormField>
              <FormField label="Home country address" className="md:col-span-2">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.address.homeCountryAddress}
                  onChange={(event) => updateNestedField('address', 'homeCountryAddress', event.target.value)}
                />
              </FormField>
              <FormField label="Street">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.address.street || ''}
                  onChange={(event) => updateNestedField('address', 'street', event.target.value)}
                />
              </FormField>
              <FormField label="City">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.address.city || ''}
                  onChange={(event) => updateNestedField('address', 'city', event.target.value)}
                />
              </FormField>
              <FormField label="State">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.address.state || ''}
                  onChange={(event) => updateNestedField('address', 'state', event.target.value)}
                />
              </FormField>
              <FormField label="Wilaya">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.address.wilaya || ''}
                  onChange={(event) => updateNestedField('address', 'wilaya', event.target.value)}
                />
              </FormField>
              <FormField label="Country code">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.address.countryCode || ''}
                  onChange={(event) => updateNestedField('address', 'countryCode', event.target.value)}
                />
              </FormField>
            </SectionCard>

            <SectionCard
              title="Banking details"
            >
              <FormField label="Bank name">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.bank.bankName}
                  onChange={(event) => updateNestedField('bank', 'bankName', event.target.value)}
                />
              </FormField>
              <FormField label="Branch name">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.bank.branchName}
                  onChange={(event) => updateNestedField('bank', 'branchName', event.target.value)}
                />
              </FormField>
              <FormField label="Branch address">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.bank.branchAddress}
                  onChange={(event) => updateNestedField('bank', 'branchAddress', event.target.value)}
                />
              </FormField>
              <FormField label="Branch code">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.bank.branchCode}
                  onChange={(event) => updateNestedField('bank', 'branchCode', event.target.value)}
                />
              </FormField>
              <FormField label="Account holder name">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.bankAccount.accountHolderName}
                  onChange={(event) => updateNestedField('bankAccount', 'accountHolderName', event.target.value)}
                />
              </FormField>
              <FormField label="Account number">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.bankAccount.accountNumber}
                  onChange={(event) => updateNestedField('bankAccount', 'accountNumber', event.target.value)}
                />
              </FormField>
              <FormField label="RIB / IBAN">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.bankAccount.iban}
                  onChange={(event) => updateNestedField('bankAccount', 'iban', event.target.value)}
                />
              </FormField>
              <FormField label="Swift code">
                <input
                  type="text"
                  className={inputClass}
                  value={draft.bankAccount.swiftCode}
                  onChange={(event) => updateNestedField('bankAccount', 'swiftCode', event.target.value)}
                />
              </FormField>
              <FormField label="Account created date">
                <input
                  type="date"
                  className={inputClass}
                  value={draft.bankAccount.dateCreated || ''}
                  onChange={(event) => updateNestedField('bankAccount', 'dateCreated', event.target.value)}
                />
              </FormField>
            </SectionCard>

            <section className="theme-card rounded-[2rem] border p-5 md:p-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <h3 className="theme-heading type-card-title">Academic history</h3>
                <Button onClick={addAcademicHistoryEntry} variant="secondary" className="md:self-start">
                  <Plus className="h-4 w-4" />
                  Add record
                </Button>
              </div>

              {(draft.academicHistory || []).length > 0 ? (
                <div className="space-y-4">
                  {(draft.academicHistory || []).map((entry, index) => (
                    <div key={entry.id} className="rounded-[1.5rem] border border-[rgba(220,205,166,0.48)] bg-[rgba(255,255,255,0.48)] p-4 md:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="theme-heading text-sm font-semibold">Progress record {index + 1}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAcademicHistoryEntry(entry.id)}
                          className="text-[color:var(--theme-danger)] hover:bg-[rgba(183,76,45,0.08)] hover:text-[color:var(--theme-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Academic year">
                          <input
                            type="text"
                            className={inputClass}
                            value={entry.year}
                            onChange={(event) => updateAcademicHistoryField(entry.id, 'year', event.target.value)}
                          />
                        </FormField>
                        <FormField label="Level">
                          <input
                            type="text"
                            className={inputClass}
                            value={entry.level}
                            onChange={(event) => updateAcademicHistoryField(entry.id, 'level', event.target.value)}
                          />
                        </FormField>
                        <FormField label="Grade">
                          <input
                            type="text"
                            className={inputClass}
                            value={entry.grade}
                            onChange={(event) => updateAcademicHistoryField(entry.id, 'grade', event.target.value)}
                          />
                        </FormField>
                        <FormField label="Date submitted">
                          <input
                            type="date"
                            className={inputClass}
                            value={entry.date}
                            onChange={(event) => updateAcademicHistoryField(entry.id, 'date', event.target.value)}
                          />
                        </FormField>
                        <FormField label="Status">
                          <select
                            className={inputClass}
                            value={entry.status}
                            onChange={(event) => updateAcademicHistoryField(entry.id, 'status', event.target.value)}
                          >
                            {academicStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </FormField>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[rgba(220,205,166,0.8)] bg-[rgba(255,255,255,0.32)] px-5 py-6 text-center">
                  <p className="theme-text-muted text-sm">Add the first record.</p>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[rgba(220,205,166,0.55)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="sm:min-w-[8rem]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={isSubmitting}
            className="sm:min-w-[10rem]"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
  );

  if (!isModal) {
    return editor;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="theme-overlay absolute inset-0" onClick={() => !isSubmitting && onClose()} />
      {editor}
    </div>
  );
}
