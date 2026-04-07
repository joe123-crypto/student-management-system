'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import type { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import PersonalDetailsStep from '@/components/features/onboarding/components/PersonalDetailsStep';
import AcademicInfoStep from '@/components/features/onboarding/components/AcademicInfoStep';
import BankRecordsStep from '@/components/features/onboarding/components/BankRecordsStep';
import ReviewDetailsStep from '@/components/features/onboarding/components/ReviewDetailsStep';
import OnboardingProgress from '@/components/features/onboarding/components/OnboardingProgress';
import { inputClass } from '@/components/features/onboarding/components/styles';
import { createEmptyStudentProfile, normalizeStudentProfile } from '@/lib/students/profile';

interface AddStudentRecordModalProps {
  open: boolean;
  students: StudentProfile[];
  onClose: () => void;
  onSubmit: (student: StudentProfile) => Promise<void>;
}

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

  return {
    givenName: parts[0] || '',
    familyName: parts.slice(1).join(' '),
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

function getValidationErrors(student: StudentProfile, students: StudentProfile[]) {
  const errors: string[] = [];
  const fullName = student.student.fullName.trim();
  const inscriptionNumber = student.student.inscriptionNumber.trim().toUpperCase();
  const email = student.contact.email.trim().toLowerCase();

  if (!fullName) {
    errors.push('Full name is required.');
  }

  if (!inscriptionNumber) {
    errors.push('Inscription number is required.');
  }

  if (!email) {
    errors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Enter a valid email address.');
  }

  if (
    inscriptionNumber &&
    students.some(
      (existingStudent) =>
        existingStudent.student.inscriptionNumber.trim().toUpperCase() === inscriptionNumber,
    )
  ) {
    errors.push('A student with this inscription number already exists.');
  }

  if (
    email &&
    students.some(
      (existingStudent) => existingStudent.contact.email.trim().toLowerCase() === email,
    )
  ) {
    errors.push('A student with this email already exists.');
  }

  return errors;
}

export default function AddStudentRecordModal({
  open,
  students,
  onClose,
  onSubmit,
}: AddStudentRecordModalProps) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<StudentProfile>(createDraftStudentProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
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
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isSubmitting, onClose, open]);

  const normalizedDraft = useMemo(() => buildStudentRecordDraft(draft), [draft]);

  const updateNestedField = (
    section: 'student' | 'passport' | 'university' | 'program' | 'bank' | 'bankAccount' | 'contact' | 'address',
    field: string,
    value: string,
  ) => {
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

    const validationErrors = getValidationErrors(normalizedDraft, students);
    if (validationErrors.length > 0) {
      setSubmitError(validationErrors.join(' '));
      setStep(4);
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

      <div className="theme-panel-glass relative z-10 flex h-[min(52rem,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border p-6 shadow-xl md:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="theme-icon-well inline-flex h-11 w-11 items-center justify-center rounded-xl border">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="theme-heading text-lg font-bold md:text-[1.7rem]">Add Student Record</h2>
              <p className="theme-text-muted mt-1 max-w-2xl text-sm">
                Reuse the onboarding steps to create a student profile directly from the attache dashboard.
              </p>
            </div>
          </div>

          <button
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
            <div className="theme-danger mb-6 rounded-3xl border px-5 py-4 text-sm font-semibold">
              {submitError}
            </div>
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

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
