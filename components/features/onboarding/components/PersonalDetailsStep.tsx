import React from 'react';
import { ArrowRight, User as UserIcon } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ReviewableFormField from './ReviewableFormField';

type PersonalFieldSection = 'student' | 'passport';

interface PersonalDetailsStepProps {
  student: StudentProfile;
  readOnlyInputClass?: string;
  inputClass?: string;
  mode?: 'read-only' | 'editable';
  onUpdateField?: (section: PersonalFieldSection, field: string, value: string) => void;
  selectedReviewFields?: string[];
  onToggleReviewField?: (fieldId: string, checked: boolean) => void;
  onRequestReview?: (selectedFieldLabels: string[]) => void;
  onNext: () => void;
  nextLabel?: string;
}

const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  student,
  readOnlyInputClass = '',
  inputClass = '',
  mode = 'read-only',
  onUpdateField,
  selectedReviewFields = [],
  onToggleReviewField,
  onRequestReview,
  onNext,
  nextLabel = 'Continue',
}) => {
  const isEditable = mode === 'editable';
  const sharedInputClass = isEditable ? inputClass : readOnlyInputClass;
  const selectedReviewFieldSet = new Set(selectedReviewFields);
  const reviewFieldLabels: Record<string, string> = {
    fullName: 'Full Name',
    inscriptionNumber: 'Inscription No.',
    passportNumber: 'Passport Number',
    passportExpiry: 'Passport Expiry',
    passportIssueDate: 'Passport Issue Date',
  };
  const selectedFieldLabels = Object.entries(reviewFieldLabels)
    .filter(([fieldId]) => selectedReviewFieldSet.has(fieldId))
    .map(([, label]) => label);
  const hasReviewSelection = selectedFieldLabels.length > 0;

  const renderField = (
    label: string,
    fieldId: string,
    input: React.ReactNode,
    className?: string,
  ) => {
    if (isEditable) {
      return (
        <FormField label={label} className={className}>
          {input}
        </FormField>
      );
    }

    return (
      <ReviewableFormField
        label={label}
        className={className}
        checked={selectedReviewFieldSet.has(fieldId)}
        onCheckedChange={(checked) => onToggleReviewField?.(fieldId, checked)}
      >
        {input}
      </ReviewableFormField>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="theme-heading type-section-title flex items-center gap-2">
        <UserIcon className="h-6 w-6 text-[color:var(--theme-primary-soft)]" />
        Personal & Passport
      </h2>
      {!isEditable ? (
        <p className="theme-text-muted max-w-2xl text-sm leading-6">
          These details are managed by administration. Tick any field that needs correction, then
          use Request review.
        </p>
      ) : null}
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
        {renderField(
          'Full Name',
          'fullName',
          <input
            type="text"
            className={sharedInputClass}
            value={student.student.fullName}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('student', 'fullName', event.target.value)}
          />,
        )}
        {renderField(
          'Inscription No.',
          'inscriptionNumber',
          <input
            type="text"
            className={sharedInputClass}
            value={student.student.inscriptionNumber}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('student', 'inscriptionNumber', event.target.value)}
          />,
        )}
        {isEditable ? (
          <>
            <FormField label="Date of Birth">
              <input
                type="date"
                className={sharedInputClass}
                value={student.student.dateOfBirth}
                onChange={(event) => onUpdateField?.('student', 'dateOfBirth', event.target.value)}
              />
            </FormField>
            <FormField label="Nationality">
              <input
                type="text"
                className={sharedInputClass}
                value={student.student.nationality}
                onChange={(event) => onUpdateField?.('student', 'nationality', event.target.value)}
              />
            </FormField>
            <FormField label="Gender">
              <select
                className={sharedInputClass}
                value={student.student.gender}
                onChange={(event) => onUpdateField?.('student', 'gender', event.target.value)}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
            <FormField label="Issuing Country">
              <input
                type="text"
                className={sharedInputClass}
                value={student.passport.issuingCountry}
                onChange={(event) => onUpdateField?.('passport', 'issuingCountry', event.target.value)}
              />
            </FormField>
          </>
        ) : null}
        {renderField(
          'Passport Number',
          'passportNumber',
          <input
            type="text"
            className={sharedInputClass}
            value={student.passport.passportNumber}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('passport', 'passportNumber', event.target.value)}
          />,
        )}
        {renderField(
          'Passport Expiry',
          'passportExpiry',
          <input
            type="date"
            className={sharedInputClass}
            value={student.passport.expiryDate}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('passport', 'expiryDate', event.target.value)}
          />,
        )}
        {renderField(
          'Passport Issue Date',
          'passportIssueDate',
          <input
            type="date"
            className={sharedInputClass}
            value={student.passport.issueDate}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('passport', 'issueDate', event.target.value)}
          />,
        )}
        <div className="pt-6 md:col-span-2">
          {isEditable ? (
            <div className="flex justify-end">
              <Button
                onClick={onNext}
                className="w-full rounded-2xl px-12 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)] md:w-auto"
              >
                <ArrowRight className="w-4 h-4" />
                {nextLabel}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={() => onRequestReview?.(selectedFieldLabels)}
                variant="secondary"
                disabled={!hasReviewSelection}
                className="w-full justify-center rounded-2xl px-6 py-3 sm:w-auto"
              >
                Request review
              </Button>
              <Button
                onClick={onNext}
                className="w-full rounded-2xl px-12 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)] md:w-auto"
              >
                <ArrowRight className="w-4 h-4" />
                {nextLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;
