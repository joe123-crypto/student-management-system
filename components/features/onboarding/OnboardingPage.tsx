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
import { mergeStudentProfile } from '@/lib/students/profile';
import { inputClass, readOnlyInputClass } from './components/styles';

interface OnboardingPageProps {
  student: StudentProfile;
  onComplete: (profilePatch: Partial<StudentProfile>) => Promise<void>;
}

type ReviewStepId = 'personal' | 'academic' | 'record';
type ContactFieldSection = 'contact' | 'address' | 'profile';

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
      accountNumber: student.bankAccount.accountNumber || '',
      iban: student.bankAccount.iban || '',
    },
    bank: {
      bankName: student.bank.bankName || '',
      bankCode: student.bank.bankCode || '',
      branchName: student.bank.branchName || '',
      branchAddress: student.bank.branchAddress || '',
      branchCode: student.bank.branchCode || '',
    },
  });

  const [contactFormData, setContactFormData] = useState<
    Pick<StudentProfile, 'contact' | 'address'>
  >({
    contact: {
      email: student.contact.email || '',
      phone: student.contact.phone || '',
      emergencyContactName: student.contact.emergencyContactName || '',
      emergencyContactPhone: student.contact.emergencyContactPhone || '',
    },
    address: {
      homeCountryAddress: student.address.homeCountryAddress || '',
      currentHostAddress: student.address.currentHostAddress || '',
      wilaya: student.address.wilaya || '',
      country: student.address.country || '',
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

  const updateContactField = (
    section: ContactFieldSection,
    field: string,
    value: string,
  ) => {
    setSubmitError('');
    if (section === 'contact') {
      setContactFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value },
      }));
    } else if (section === 'address') {
      setContactFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    }
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
    contact: contactFormData.contact,
    address: contactFormData.address,
  });

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onComplete({
        bank: formData.bank,
        bankAccount: formData.bankAccount,
        contact: contactFormData.contact,
        address: contactFormData.address,
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
            title="Something went wrong"
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
              student={draftProfile}
              readOnlyInputClass={readOnlyInputClass}
              inputClass={inputClass}
              mode="editable"
              onUpdateField={updateContactField}
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
