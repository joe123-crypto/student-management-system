import React from 'react';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ReviewableFormField from './ReviewableFormField';

type AcademicFieldSection = 'university' | 'program';

interface AcademicInfoStepProps {
  student: StudentProfile;
  readOnlyInputClass?: string;
  inputClass?: string;
  mode?: 'read-only' | 'editable';
  onUpdateField?: (section: AcademicFieldSection, field: string, value: string) => void;
  selectedReviewFields?: string[];
  onToggleReviewField?: (fieldId: string, checked: boolean) => void;
  onRequestReview?: (selectedFieldLabels: string[]) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}

const AcademicInfoStep: React.FC<AcademicInfoStepProps> = ({
  student,
  readOnlyInputClass = '',
  inputClass = '',
  mode = 'read-only',
  onUpdateField,
  selectedReviewFields = [],
  onToggleReviewField,
  onRequestReview,
  onBack,
  onNext,
  nextLabel = 'Continue',
}) => {
  const isEditable = mode === 'editable';
  const sharedInputClass = isEditable ? inputClass : readOnlyInputClass;
  const selectedReviewFieldSet = new Set(selectedReviewFields);
  const reviewFieldLabels: Record<string, string> = {
    universityName: 'University Name',
    acronym: 'Acronym',
    major: 'Program / Major',
    degreeLevel: 'Degree Level',
    department: 'Department',
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
        <GraduationCap className="h-6 w-6 text-[color:var(--theme-primary-soft)]" />
        University & Program
      </h2>
      {!isEditable ? (
        <p className="theme-text-muted max-w-2xl text-sm leading-6">
          If any academic detail is incorrect, tick the field and use Request review.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-y-6 items-end md:grid-cols-2 md:gap-x-8">
        {renderField(
          'University Name',
          'universityName',
          <input
            type="text"
            className={sharedInputClass}
            value={student.university.universityName}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('university', 'universityName', event.target.value)}
          />,
        )}
        {renderField(
          'Acronym',
          'acronym',
          <input
            type="text"
            className={sharedInputClass}
            value={student.university.acronym}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('university', 'acronym', event.target.value)}
          />,
        )}
        {isEditable ? (
          <>
            <FormField label="Campus">
              <input
                type="text"
                className={sharedInputClass}
                value={student.university.campus}
                onChange={(event) => onUpdateField?.('university', 'campus', event.target.value)}
              />
            </FormField>
            <FormField label="City">
              <input
                type="text"
                className={sharedInputClass}
                value={student.university.city}
                onChange={(event) => onUpdateField?.('university', 'city', event.target.value)}
              />
            </FormField>
          </>
        ) : null}
        {renderField(
          'Program / Major',
          'major',
          <input
            type="text"
            className={sharedInputClass}
            value={student.program.major}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('program', 'major', event.target.value)}
          />,
        )}
        {renderField(
          'Degree Level',
          'degreeLevel',
          <input
            type="text"
            className={sharedInputClass}
            value={student.program.degreeLevel}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('program', 'degreeLevel', event.target.value)}
          />,
        )}
        {renderField(
          'Department',
          'department',
          <input
            type="text"
            className={sharedInputClass}
            value={student.university.department || (isEditable ? '' : 'N/A')}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('university', 'department', event.target.value)}
          />,
          isEditable ? '' : 'md:col-span-2',
        )}
        {isEditable ? (
          <>
            <FormField label="Program Start Date">
              <input
                type="date"
                className={sharedInputClass}
                value={student.program.startDate}
                onChange={(event) => onUpdateField?.('program', 'startDate', event.target.value)}
              />
            </FormField>
            <FormField label="Expected End Date" className="md:col-span-2">
              <input
                type="date"
                className={sharedInputClass}
                value={student.program.expectedEndDate}
                onChange={(event) => onUpdateField?.('program', 'expectedEndDate', event.target.value)}
              />
            </FormField>
          </>
        ) : null}
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 pt-6 md:col-span-2 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <Button
            onClick={onBack}
            variant="secondary"
            className="min-w-0 justify-center rounded-2xl px-4 py-3 sm:w-auto sm:px-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {isEditable ? (
            <Button
              onClick={onNext}
              className="min-w-0 justify-center rounded-2xl px-4 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)] sm:w-auto sm:px-12"
            >
              <ArrowRight className="w-4 h-4" />
              {nextLabel}
            </Button>
          ) : (
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                onClick={() => onRequestReview?.(selectedFieldLabels)}
                variant="secondary"
                disabled={!hasReviewSelection}
                className="min-w-0 justify-center rounded-2xl px-4 py-3 sm:w-auto sm:px-6"
              >
                Request review
              </Button>
              <Button
                onClick={onNext}
                className="min-w-0 justify-center rounded-2xl px-4 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)] sm:w-auto sm:px-12"
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

export default AcademicInfoStep;
