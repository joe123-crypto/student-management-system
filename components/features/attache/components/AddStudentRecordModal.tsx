'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import type { StudentProfile } from '@/types';
import PersonalDetailsStep from '@/components/features/onboarding/components/PersonalDetailsStep';
import AcademicInfoStep from '@/components/features/onboarding/components/AcademicInfoStep';
import BankRecordsStep from '@/components/features/onboarding/components/BankRecordsStep';
import ReviewDetailsStep from '@/components/features/onboarding/components/ReviewDetailsStep';
import OnboardingProgress from '@/components/features/onboarding/components/OnboardingProgress';
import { inputClass } from '@/components/features/onboarding/components/styles';
import Notice from '@/components/ui/Notice';
import { createEmptyStudentProfile, normalizeStudentProfile } from '@/lib/students/profile';

interface AddStudentRecordModalProps {
  open: boolean;
  students: StudentProfile[];
  onClose: () => void;
  onSubmit: (student: StudentProfile) => Promise<void>;
}

type ModalStep = 1 | 2 | 3 | 4;
type ValidationIssue = {
  message: string;
  step: ModalStep;
};

function createDraftStudentProfile(): StudentProfile {
  const base = createEmptyStudentProfile({ status: 'PENDING' });

  return {
    ...base,
    student: {
      ...base.student,
      fullName: '',
      givenName: '',
      familyName: '',
      inscriptionNumber: '',
      dateOfBirth: '',
      nationality: '',
      gender: 'M',
    },
    passport: {
      ...base.passport,
      passportNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingCountry: '',
    },
    bankAccount: {
      ...base.bankAccount,
      accountHolderName: '',
    },
    contact: {
      ...base.contact,
      email: '',
    },
    address: {
      ...base.address,
      homeCountryAddress: '',
      currentHostAddress: '',
    },
    status: 'PENDING',
  };
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      givenName: parts[0] || '',
      familyName: '',
    };
  }

  if (parts.length === 2) {
    return {
      givenName: parts[0],
      familyName: parts[1],
    };
  }

  // Multi-part names are culturally ambiguous, so avoid guessing and let
  // fullName stay authoritative unless the user explicitly edits sub-fields.
  return {
    givenName: '',
    familyName: '',
  };
}

function buildStudentRecordDraft(draft: StudentProfile): StudentProfile {
  const fullName = draft.student.fullName.trim();
  const { givenName, familyName } = splitFullName(fullName);

  return normalizeStudentProfile({
    ...draft,
    student: {
      ...draft.student,
      fullName,
      givenName: draft.student.givenName.trim() || givenName,
      familyName: draft.student.familyName.trim() || familyName,
      inscriptionNumber: draft.student.inscriptionNumber.trim().toUpperCase(),
    },
    contact: {
      ...draft.contact,
      email: draft.contact.email.trim().toLowerCase(),
    },
    bankAccount: {
      ...draft.bankAccount,
      accountHolderName: draft.bankAccount.accountHolderName.trim() || fullName,
    },
    status: draft.status,
  });
}

function getValidationIssues(student: StudentProfile, students: StudentProfile[]) {
  const issues: ValidationIssue[] = [];
  const fullName = student.student.fullName.trim();
  const inscriptionNumber = student.student.inscriptionNumber.trim().toUpperCase();
  const email = student.contact.email.trim().toLowerCase();

  if (!fullName) {
    issues.push({ message: 'Full name is required.', step: 1 });
  }

  if (!inscriptionNumber) {
    issues.push({ message: 'Inscription number is required.', step: 1 });
  }

  if (!email) {
    issues.push({ message: 'Email is required.', step: 4 });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    issues.push({ message: 'Enter a valid email address.', step: 4 });
  }

  if (
    inscriptionNumber &&
    students.some(
      (existingStudent) =>
        existingStudent.student.inscriptionNumber.trim().toUpperCase() === inscriptionNumber,
    )
  ) {
    issues.push({
      message: 'A student with this inscription number already exists.',
      step: 1,
    });
  }

  if (
    email &&
    students.some(
      (existingStudent) => existingStudent.contact.email.trim().toLowerCase() === email,
    )
  ) {
    issues.push({
      message: 'A student with this email already exists.',
      step: 4,
    });
  }

  return issues;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('aria-hidden') && element.getClientRects().length > 0);
}

export default function AddStudentRecordModal({
  open,
  students,
  onClose,
  onSubmit,
}: AddStudentRecordModalProps) {
  const [step, setStep] = useState<ModalStep>(1);
  const [draft, setDraft] = useState<StudentProfile>(createDraftStudentProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const totalSteps = 4;

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(1);
    setDraft(createDraftStudentProfile());
    setIsSubmitting(false);
    setSubmitError('');
  }, [open]);

  useEffect(() => {
    if (!open) {
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
  }, [isSubmitting, onClose, open]);

  const normalizedDraft = useMemo(() => buildStudentRecordDraft(draft), [draft]);

  const updateNestedField = (
    sectionKey:
      | 'student'
      | 'passport'
      | 'university'
      | 'program'
      | 'bank'
      | 'bankAccount'
      | 'contact'
      | 'address',
    field: string,
    value: string,
  ) => {
    setSubmitError('');
    setDraft((current) => {
      const currentSection = current[sectionKey];
      const nextDraft = {
        ...current,
        [sectionKey]: {
          ...currentSection,
          [field]: value,
        },
      } as StudentProfile;

      if (sectionKey === 'student' && field === 'fullName') {
        const currentHolderName = current.bankAccount.accountHolderName.trim();
        if (!currentHolderName || currentHolderName === current.student.fullName.trim()) {
          nextDraft.bankAccount = {
            ...nextDraft.bankAccount,
            accountHolderName: value,
          };
        }
      }

      return nextDraft;
    });
  };

  const updateProfileField = (field: 'status', value: string) => {
    setSubmitError('');
    setDraft((current) => ({
      ...current,
      [field]: value as StudentProfile['status'],
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const validationIssues = getValidationIssues(normalizedDraft, students);
    if (validationIssues.length > 0) {
      const earliestErrorStep = validationIssues.reduce<ModalStep>(
        (earliest, issue) => Math.min(earliest, issue.step) as ModalStep,
        4,
      );

      setSubmitError(validationIssues.map((issue) => issue.message).join(' '));
      setStep(earliestErrorStep);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(normalizedDraft);
    } catch (error) {
      console.error('[STUDENTS] Failed to add student record:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'We could not add this student record. Please try again.',
      );
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="theme-overlay absolute inset-0" onClick={() => !isSubmitting && onClose()} />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="theme-panel-glass relative z-10 flex h-[min(52rem,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border p-6 shadow-xl md:p-8"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="theme-icon-well inline-flex h-11 w-11 items-center justify-center rounded-xl border">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 id={titleId} className="theme-heading text-lg font-bold md:text-[1.7rem]">
              Add Student Record
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="theme-card-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close add student modal"
            disabled={isSubmitting}
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <OnboardingProgress
            step={step}
            totalSteps={totalSteps}
            title="Student Record Setup"
            stepLabel="Step"
          />

          {submitError ? (
            <Notice
              tone="error"
              title="Student record could not be created"
              message={submitError}
              className="mb-6 rounded-3xl px-5 py-4"
            />
          ) : null}

          <div className="theme-card rounded-[2.5rem] border p-8 md:p-10">
            {step === 1 ? (
              <PersonalDetailsStep
                student={draft}
                mode="editable"
                inputClass={inputClass}
                onUpdateField={updateNestedField}
                onNext={() => setStep(2)}
              />
            ) : null}

            {step === 2 ? (
              <AcademicInfoStep
                student={draft}
                mode="editable"
                inputClass={inputClass}
                onUpdateField={updateNestedField}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            ) : null}

            {step === 3 ? (
              <BankRecordsStep
                formData={{
                  bank: draft.bank,
                  bankAccount: draft.bankAccount,
                }}
                inputClass={inputClass}
                onUpdateField={updateNestedField}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
              />
            ) : null}

            {step === 4 ? (
              <ReviewDetailsStep
                student={draft}
                mode="editable"
                inputClass={inputClass}
                onUpdateField={(section, field, value) => {
                  if (section === 'profile') {
                    updateProfileField(field as 'status', value);
                    return;
                  }

                  updateNestedField(section, field, value);
                }}
                onBack={() => setStep(3)}
                onComplete={handleSubmit}
                isSubmitting={isSubmitting}
                completeLabel="Create Student Record"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
