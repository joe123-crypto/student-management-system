import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfile, User } from '@/types';
import AcademicInfoStep from './components/AcademicInfoStep';
import BankRecordsStep from './components/BankRecordsStep';
import OnboardingProgress from './components/OnboardingProgress';
import PersonalDetailsStep from './components/PersonalDetailsStep';
import ReviewDetailsStep from './components/ReviewDetailsStep';
import { inputClass, readOnlyInputClass } from './components/styles';

interface OnboardingPageProps {
  user: User;
  student: StudentProfile;
  onComplete: (profilePatch: Partial<StudentProfile>) => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, student, onComplete }) => {
  const [step, setStep] = useState(1);
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

  const handleSubmit = () => {
    onComplete({
      bank: formData.bank,
      bankAccount: formData.bankAccount,
      status: 'ACTIVE',
    });
    router.push('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <OnboardingProgress step={step} totalSteps={totalSteps} />

        <div className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-200 transition-all ${step === 1 ? 'p-8 md:p-10' : 'p-8 md:p-12'}`}>
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
              onComplete={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

