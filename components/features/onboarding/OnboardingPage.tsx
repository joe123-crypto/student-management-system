import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentProfile, User } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

interface OnboardingPageProps {
  user: User;
  onComplete: (profile: StudentProfile) => void;
}

const inputClass =
  'w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all';

const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    student: { fullName: '', givenName: '', familyName: '', inscriptionNumber: '', dateOfBirth: '', nationality: '', gender: 'M' },
    passport: { passportNumber: '', issueDate: '', expiryDate: '', issuingCountry: '' },
    university: { universityName: '', acronym: '', campus: '', city: '' },
    program: { degreeLevel: '', major: '', startDate: '', expectedEndDate: '' },
    bankAccount: { accountHolderName: '', accountNumber: '', iban: '', swiftCode: '' },
    bank: { bankName: '', branchName: '', branchAddress: '', branchCode: '' },
    contact: { email: user.email, phone: '', emergencyContactName: '', emergencyContactPhone: '' },
    address: { homeCountryAddress: '', currentHostAddress: '' },
  });

  const updateField = (section: keyof StudentProfile, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    const finalProfile: StudentProfile = {
      ...(formData as StudentProfile),
      id: Math.random().toString(36).substr(2, 9),
      status: 'ACTIVE',
    };

    onComplete(finalProfile);
    router.push('/student-dashboard');
  };

  const steps = [
    { id: 1, title: 'Personal Details' },
    { id: 2, title: 'Academic Info' },
    { id: 3, title: 'Bank Records' },
    { id: 4, title: 'Contact & Address' },
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
              <h2 className="text-2xl font-bold text-slate-900 font-rounded">Personal & Passport</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <FormField label="Full Name">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.student?.fullName}
                    onChange={(e) => updateField('student', 'fullName', e.target.value)}
                  />
                </FormField>
                <FormField label="Inscription No.">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.student?.inscriptionNumber}
                    onChange={(e) => updateField('student', 'inscriptionNumber', e.target.value)}
                  />
                </FormField>
                <FormField label="Passport Number">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.passport?.passportNumber}
                    onChange={(e) => updateField('passport', 'passportNumber', e.target.value)}
                  />
                </FormField>
                <FormField label="Passport Expiry">
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.passport?.expiryDate}
                    onChange={(e) => updateField('passport', 'expiryDate', e.target.value)}
                  />
                </FormField>
                <FormField label="Passport Issue Date">
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.passport?.issueDate}
                    onChange={(e) => updateField('passport', 'issueDate', e.target.value)}
                  />
                </FormField>
                <div className="flex justify-end">
                  <Button onClick={nextStep} className="w-full md:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700">
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded">University & Program</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <FormField label="University Name">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.university?.universityName}
                    onChange={(e) => updateField('university', 'universityName', e.target.value)}
                  />
                </FormField>
                <FormField label="Acronym">
                  <input
                    type="text"
                    placeholder="e.g. MIT"
                    className={inputClass}
                    value={formData.university?.acronym}
                    onChange={(e) => updateField('university', 'acronym', e.target.value)}
                  />
                </FormField>
                <FormField label="Program / Major">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.program?.major}
                    onChange={(e) => updateField('program', 'major', e.target.value)}
                  />
                </FormField>
                <FormField label="Degree Level">
                  <select
                    className={inputClass}
                    value={formData.program?.degreeLevel}
                    onChange={(e) => updateField('program', 'degreeLevel', e.target.value)}
                  >
                    <option value="">Select level</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </FormField>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <Button onClick={prevStep} variant="secondary" className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-600">
                    Back
                  </Button>
                  <Button onClick={nextStep} className="px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700">
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded">Bank Account Details</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <FormField label="Bank Name" className="col-span-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bank?.bankName}
                    onChange={(e) => updateField('bank', 'bankName', e.target.value)}
                  />
                </FormField>
                <FormField label="Account Number">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bankAccount?.accountNumber}
                    onChange={(e) => updateField('bankAccount', 'accountNumber', e.target.value)}
                  />
                </FormField>
                <FormField label="RIB Key">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bankAccount?.iban}
                    onChange={(e) => updateField('bankAccount', 'iban', e.target.value)}
                  />
                </FormField>
                <FormField label="Branch Code">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bank?.branchCode}
                    onChange={(e) => updateField('bank', 'branchCode', e.target.value)}
                  />
                </FormField>
                <FormField label="Branch Address">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.bank?.branchAddress}
                    onChange={(e) => updateField('bank', 'branchAddress', e.target.value)}
                  />
                </FormField>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <Button onClick={prevStep} variant="secondary" className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-600">
                    Back
                  </Button>
                  <div className="flex items-center gap-6">
                    <Button onClick={nextStep} variant="ghost" className="text-sm font-bold text-slate-400 hover:text-slate-600">
                      Skip for now
                    </Button>
                    <Button onClick={nextStep} className="px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700">
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded">Contact & Address</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <FormField label="Phone Number">
                  <input
                    type="tel"
                    className={inputClass}
                    value={formData.contact?.phone}
                    onChange={(e) => updateField('contact', 'phone', e.target.value)}
                  />
                </FormField>
                <FormField label="Emergency Contact">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.contact?.emergencyContactName}
                    onChange={(e) => updateField('contact', 'emergencyContactName', e.target.value)}
                  />
                </FormField>
                <FormField label="Current Address in Host Country" className="col-span-2">
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={formData.address?.currentHostAddress}
                    onChange={(e) => updateField('address', 'currentHostAddress', e.target.value)}
                  />
                </FormField>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <Button onClick={prevStep} variant="secondary" className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-600">
                    Back
                  </Button>
                  <div className="flex items-center gap-6">
                    <Button onClick={handleSubmit} variant="ghost" className="text-sm font-bold text-slate-400 hover:text-slate-600">
                      Skip for now
                    </Button>
                    <Button onClick={handleSubmit} variant="success" className="px-12 py-4 rounded-2xl">
                      Complete Onboarding
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
