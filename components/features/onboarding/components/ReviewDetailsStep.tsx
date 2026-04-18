import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ReviewableFormField from './ReviewableFormField';

type ReviewFieldSection = 'contact' | 'address' | 'profile';

interface ReviewDetailsStepProps {
  student: StudentProfile;
  readOnlyInputClass?: string;
  inputClass?: string;
  mode?: 'read-only' | 'editable';
  onUpdateField?: (section: ReviewFieldSection, field: string, value: string) => void;
  selectedReviewFields?: string[];
  onToggleReviewField?: (fieldId: string, checked: boolean) => void;
  onRequestReview?: (selectedFieldLabels: string[]) => void;
  onBack: () => void;
  onComplete: () => Promise<void>;
  isSubmitting: boolean;
  completeLabel?: string;
}

const ReviewDetailsStep: React.FC<ReviewDetailsStepProps> = ({
  student,
  readOnlyInputClass = '',
  inputClass = '',
  mode = 'read-only',
  onUpdateField,
  selectedReviewFields = [],
  onToggleReviewField,
  onRequestReview,
  onBack,
  onComplete,
  isSubmitting,
  completeLabel = 'Complete and Continue',
}) => {
  const isEditable = mode === 'editable';
  const sharedInputClass = isEditable ? inputClass : readOnlyInputClass;
  const selectedReviewFieldSet = new Set(selectedReviewFields);
  const reviewFieldLabels: Record<string, string> = {
    email: 'Email',
    phone: 'Phone Number',
    hostAddress: 'Host Address',
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
        <MapPin className="h-6 w-6 text-[color:var(--theme-primary-soft)]" />
        Review Record
      </h2>
      {!isEditable ? (
        <p className="theme-text-muted max-w-2xl text-sm leading-6">
          Tick any contact or address detail that needs a manual review before you finish onboarding.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-8">
        {renderField(
          'Email',
          'email',
          <input
            type="email"
            className={sharedInputClass}
            value={student.contact.email || (isEditable ? '' : '---')}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('contact', 'email', event.target.value)}
          />,
        )}
        {renderField(
          'Phone Number',
          'phone',
          <input
            type="text"
            className={sharedInputClass}
            value={student.contact.phone || (isEditable ? '' : '---')}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('contact', 'phone', event.target.value)}
          />,
        )}
        {renderField(
          'Host Address',
          'hostAddress',
          <input
            type="text"
            className={sharedInputClass}
            value={student.address.currentHostAddress || (isEditable ? '' : '---')}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('address', 'currentHostAddress', event.target.value)}
          />,
          'md:col-span-2',
        )}
        {isEditable ? (
          <>
            <FormField label="Home Country Address" className="md:col-span-2">
              <input
                type="text"
                className={sharedInputClass}
                value={student.address.homeCountryAddress}
                onChange={(event) => onUpdateField?.('address', 'homeCountryAddress', event.target.value)}
              />
            </FormField>
            <FormField label="Status" className="md:col-span-2">
              <input
                type="text"
                className={sharedInputClass}
                value={student.status}
                onChange={(event) => onUpdateField?.('profile', 'status', event.target.value)}
              />
            </FormField>
          </>
        ) : null}
        <div className="pt-6 flex flex-col gap-4 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={onBack}
            disabled={isSubmitting}
            variant="secondary"
            className="w-full justify-center rounded-2xl px-8 py-3 sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!isEditable ? (
              <Button
                onClick={() => onRequestReview?.(selectedFieldLabels)}
                disabled={!hasReviewSelection || isSubmitting}
                variant="secondary"
                className="w-full justify-center rounded-2xl px-6 py-3 sm:w-auto"
              >
                Request review
              </Button>
            ) : null}
            <Button
              onClick={() => {
                void onComplete();
              }}
              disabled={isSubmitting}
              className="self-end whitespace-nowrap rounded-2xl px-6 py-3.5 text-sm shadow-[0_18px_36px_rgba(37,79,34,0.16)] sm:px-12 sm:py-4"
            >
              {isSubmitting ? 'Saving...' : completeLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailsStep;
