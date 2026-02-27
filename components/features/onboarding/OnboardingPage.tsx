import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfile, User } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { ArrowLeft, ArrowRight, GraduationCap, Landmark, MapPin, User as UserIcon } from 'lucide-react';

interface OnboardingPageProps {
  user: User;
  student: StudentProfile;
  onComplete: (profilePatch: Partial<StudentProfile>) => void;
}

const inputClass =
  'w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all';
const readOnlyInputClass =
  'w-full px-5 py-3.5 bg-slate-100/70 border border-slate-200 rounded-2xl text-slate-700';

const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, student, onComplete }) => {
  const [step, setStep] = useState(1);
  const router = useRouter();

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

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    onComplete({
      bank: formData.bank,
      bankAccount: formData.bankAccount,
      status: 'ACTIVE',
    });
    router.push('/student/dashboard');
  };

  const steps = [
    { id: 1, title: 'Personal Details' },
    { id: 2, title: 'Academic Info' },
    { id: 3, title: 'Bank Records' },
    { id: 4, title: 'Review Details' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-slate-900">Account Onboarding</h1>
            <span className="text-slate-500 font-medium">Step {step} of 4</span>
          </div>

          <div className="flex gap-2 h-2">
            {steps.map((s) => (
              <div key={s.id} className={`flex-1 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-200 transition-all ${step === 1 ? 'p-8 md:p-10' : 'p-8 md:p-12'}`}>
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-indigo-600" />
                Personal & Passport
              </h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <FormField label="Full Name">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.student.fullName}
                    readOnly
                  />
                </FormField>
                <FormField label="Inscription No.">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.student.inscriptionNumber}
                    readOnly
                  />
                </FormField>
                <FormField label="Passport Number">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.passport.passportNumber}
                    readOnly
                  />
                </FormField>
                <FormField label="Passport Expiry">
                  <input
                    type="date"
                    className={readOnlyInputClass}
                    value={student.passport.expiryDate}
                    readOnly
                  />
                </FormField>
                <FormField label="Passport Issue Date">
                  <input
                    type="date"
                    className={readOnlyInputClass}
                    value={student.passport.issueDate}
                    readOnly
                  />
                </FormField>
                <div className="flex justify-end">
                  <Button onClick={nextStep} className="w-full md:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <ArrowRight className="w-4 h-4" />
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                University & Program
              </h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <FormField label="University Name">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.university.universityName}
                    readOnly
                  />
                </FormField>
                <FormField label="Acronym">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.university.acronym}
                    readOnly
                  />
                </FormField>
                <FormField label="Program / Major">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.program.major}
                    readOnly
                  />
                </FormField>
                <FormField label="Degree Level">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.program.degreeLevel}
                    readOnly
                  />
                </FormField>
                <FormField label="Department" className="md:col-span-2">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.university.department || 'N/A'}
                    readOnly
                  />
                </FormField>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <Button onClick={prevStep} variant="secondary" className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-600">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={nextStep} className="px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <ArrowRight className="w-4 h-4" />
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded flex items-center gap-2">
                <Landmark className="w-6 h-6 text-indigo-600" />
                Bank Account Details
              </h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <FormField label="Bank Name" className="col-span-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bank.bankName}
                    onChange={(e) => updateField('bank', 'bankName', e.target.value)}
                  />
                </FormField>
                <FormField label="Account Number">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bankAccount.accountNumber}
                    onChange={(e) => updateField('bankAccount', 'accountNumber', e.target.value)}
                  />
                </FormField>
                <FormField label="RIB Key">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bankAccount.iban}
                    onChange={(e) => updateField('bankAccount', 'iban', e.target.value)}
                  />
                </FormField>
                <FormField label="Branch Code">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bank.branchCode}
                    onChange={(e) => updateField('bank', 'branchCode', e.target.value)}
                  />
                </FormField>
                <FormField label="Branch Address">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bank.branchAddress}
                    onChange={(e) => updateField('bank', 'branchAddress', e.target.value)}
                  />
                </FormField>
                <FormField label="Branch Name">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bank.branchName}
                    onChange={(e) => updateField('bank', 'branchName', e.target.value)}
                  />
                </FormField>
                <FormField label="Account Holder Name">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bankAccount.accountHolderName}
                    onChange={(e) => updateField('bankAccount', 'accountHolderName', e.target.value)}
                  />
                </FormField>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <Button onClick={prevStep} variant="secondary" className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-600">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <div className="flex items-center gap-6">
                    <Button onClick={nextStep} variant="ghost" className="text-sm font-bold text-slate-400 hover:text-slate-600">
                      Skip for now
                    </Button>
                    <Button onClick={nextStep} className="px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700">
                      <ArrowRight className="w-4 h-4" />
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded flex items-center gap-2">
                <MapPin className="w-6 h-6 text-indigo-600" />
                Review Record
              </h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField label="Email">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.contact.email || user.legacyEmail || '---'}
                    readOnly
                  />
                </FormField>
                <FormField label="Phone Number">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.contact.phone || '---'}
                    readOnly
                  />
                </FormField>
                <FormField label="Host Address" className="col-span-2">
                  <input
                    type="text"
                    className={readOnlyInputClass}
                    value={student.address.currentHostAddress || '---'}
                    readOnly
                  />
                </FormField>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <Button onClick={prevStep} variant="secondary" className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-600">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <div className="flex items-center gap-6">
                    <Button onClick={handleSubmit} variant="success" className="px-12 py-4 rounded-2xl">
                      Complete and Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

