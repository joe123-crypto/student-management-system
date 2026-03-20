import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfile, User } from '@/types';
import AcademicInfoStep from './components/AcademicInfoStep';
import BankRecordsStep from './components/BankRecordsStep';
import OnboardingProgress from './components/OnboardingProgress';
import PersonalDetailsStep from './components/PersonalDetailsStep';
import ReviewDetailsStep from './components/ReviewDetailsStep';
import { getMissingStudentOnboardingFields, mergeStudentProfile } from '@/lib/students/profile';
import { inputClass, readOnlyInputClass } from './components/styles';

interface OnboardingPageProps {
  user: User;
  student: StudentProfile;
  onComplete: (profilePatch: Partial<StudentProfile>) => Promise<void>;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, student, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
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
        status: 'ACTIVE',
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
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {submitError}
          </div>
        ) : null}

        <div
          className={`theme-card rounded-[2.5rem] border transition-all ${
            step === 1 ? 'p-8 md:p-10' : 'p-8 md:p-12'
          }`}
        >
          {step === 1 && <PersonalDetailsStep student={student} readOnlyInputClass={readOnlyInputClass} onNext={nextStep} />}
          {step === 2 && (
            <AcademicInfoStep
              student={student}
              readOnlyInputClass={readOnlyInputClass}
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
              user={user}
              student={student}
              readOnlyInputClass={readOnlyInputClass}
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

