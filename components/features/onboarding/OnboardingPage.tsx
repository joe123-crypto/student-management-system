import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfile } from '@/types';
import AcademicInfoStep from './components/AcademicInfoStep';
import BankRecordsStep from './components/BankRecordsStep';
import OnboardingProgress from './components/OnboardingProgress';
import PersonalDetailsStep from './components/PersonalDetailsStep';
import ReviewDetailsStep from './components/ReviewDetailsStep';
import Notice from '@/components/ui/Notice';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { getMissingStudentOnboardingFields, mergeStudentProfile } from '@/lib/students/profile';
import { inputClass, readOnlyInputClass } from './components/styles';

interface OnboardingPageProps {
  student: StudentProfile;
  onComplete: (profilePatch: Partial<StudentProfile>) => Promise<void>;
}

type ReviewStepId = 'personal' | 'academic' | 'record';

const OnboardingPage: React.FC<OnboardingPageProps> = ({ student, onComplete }) => {
  const notifications = useNotifications();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedReviewFields, setSelectedReviewFields] = useState<Record<ReviewStepId, string[]>>({
    personal: [],
    academic: [],
    record: [],
  });
  const router = useRouter();
  const totalSteps = 4;

  const [formData, setFormData] = useState<Pick<StudentProfile, 'bankAccount' | 'bank'>>({
    bankAccount: {
      accountHolderName: student.bankAccount.accountHolderName || student.student.fullName,
      accountNumber: student.bankAccount.accountNumber || '',
      iban: student.bankAccount.iban || '',
      swiftCode: student.bankAccount.swiftCode || '',
    },
    bank: {
      bankName: student.bank.bankName || '',
      branchName: student.bank.branchName || '',
      branchAddress: student.bank.branchAddress || '',
      branchCode: student.bank.branchCode || '',
    },
  });

  const updateField = (section: 'bankAccount' | 'bank', field: string, value: string) => {
    setSubmitError('');
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateReviewFieldSelection = (
    reviewStepId: ReviewStepId,
    fieldId: string,
    checked: boolean,
  ) => {
    setSelectedReviewFields((current) => {
      const currentFields = current[reviewStepId];
      const nextFields = checked
        ? currentFields.includes(fieldId)
          ? currentFields
          : [...currentFields, fieldId]
        : currentFields.filter((currentFieldId) => currentFieldId !== fieldId);

      return {
        ...current,
        [reviewStepId]: nextFields,
      };
    });
  };

  const handleRequestReview = (stepLabel: string, fieldLabels: string[]) => {
    if (fieldLabels.length === 0) {
      return;
    }

    const formattedFields =
      fieldLabels.length === 1
        ? fieldLabels[0]
        : fieldLabels.length === 2
          ? `${fieldLabels[0]} and ${fieldLabels[1]}`
          : `${fieldLabels[0]}, ${fieldLabels[1]}, and ${fieldLabels.length - 2} more`;
    const fieldsVerb = fieldLabels.length === 1 ? 'has' : 'have';

    notifications.notify({
      tone: 'success',
      title: 'Review marked',
      message: `${formattedFields} ${fieldsVerb} been marked for review in ${stepLabel}.`,
    });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const draftProfile = mergeStudentProfile(student, {
    bank: formData.bank,
    bankAccount: formData.bankAccount,
  });
  const missingOnboardingFields = getMissingStudentOnboardingFields(draftProfile);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (missingOnboardingFields.length > 0) {
      const requirementLabel = missingOnboardingFields.length === 1 ? 'field' : 'fields';
      setSubmitError(
        `Complete the required onboarding ${requirementLabel}: ${missingOnboardingFields.join(', ')}.`,
      );
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onComplete({
        bank: formData.bank,
        bankAccount: formData.bankAccount,
      });
      router.replace('/student/dashboard');
    } catch (error) {
      console.error('[ONBOARDING] Failed to complete student onboarding:', error);
      setSubmitError('We could not save your onboarding details. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-shell min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <OnboardingProgress step={step} totalSteps={totalSteps} />
        {submitError ? (
          <Notice
            tone="error"
            title="Onboarding details incomplete"
            message={submitError}
            className="mb-6 rounded-3xl px-5 py-4"
          />
        ) : null}

        <div
          className={`theme-card rounded-[2.5rem] border transition-all ${
            step === 1 ? 'p-5 sm:p-8 md:p-10' : 'p-5 sm:p-8 md:p-12'
          }`}
        >
          {step === 1 && (
            <PersonalDetailsStep
              student={student}
              readOnlyInputClass={readOnlyInputClass}
              selectedReviewFields={selectedReviewFields.personal}
              onToggleReviewField={(fieldId, checked) =>
                updateReviewFieldSelection('personal', fieldId, checked)
              }
              onRequestReview={(fieldLabels) => handleRequestReview('Personal & Passport', fieldLabels)}
              onNext={nextStep}
            />
          )}
          {step === 2 && (
            <AcademicInfoStep
              student={student}
              readOnlyInputClass={readOnlyInputClass}
              selectedReviewFields={selectedReviewFields.academic}
              onToggleReviewField={(fieldId, checked) =>
                updateReviewFieldSelection('academic', fieldId, checked)
              }
              onRequestReview={(fieldLabels) => handleRequestReview('University & Program', fieldLabels)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 3 && (
            <BankRecordsStep
              formData={formData}
              inputClass={inputClass}
              onUpdateField={updateField}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 4 && (
            <ReviewDetailsStep
              student={student}
              readOnlyInputClass={readOnlyInputClass}
              selectedReviewFields={selectedReviewFields.record}
              onToggleReviewField={(fieldId, checked) =>
                updateReviewFieldSelection('record', fieldId, checked)
              }
              onRequestReview={(fieldLabels) => handleRequestReview('Review Record', fieldLabels)}
              onBack={prevStep}
              isSubmitting={isSubmitting}
              onComplete={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

