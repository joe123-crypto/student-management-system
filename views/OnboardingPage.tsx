
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, StudentProfile, UserRole } from '../types';

interface OnboardingPageProps {
  user: User;
  onComplete: (profile: StudentProfile) => void;
}

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
    address: { homeCountryAddress: '', currentHostAddress: '' }
  });

  const updateField = (section: keyof StudentProfile, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    const finalProfile: StudentProfile = {
      ...formData as StudentProfile,
      id: Math.random().toString(36).substr(2, 9),
      status: 'ACTIVE'
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
            {steps.map(s => (
              <div 
                key={s.id} 
                className={`flex-1 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-indigo-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-200 transition-all ${step === 1 ? 'p-8 md:p-10' : 'p-8 md:p-12'}`}>
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded">Personal & Passport</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.student?.fullName}
                    onChange={(e) => updateField('student', 'fullName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Inscription No.</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.student?.inscriptionNumber}
                    onChange={(e) => updateField('student', 'inscriptionNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Passport Number</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.passport?.passportNumber}
                    onChange={(e) => updateField('passport', 'passportNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Passport Expiry</label>
                  <input 
                    type="date" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.passport?.expiryDate}
                    onChange={(e) => updateField('passport', 'expiryDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Passport Issue Date</label>
                  <input 
                    type="date" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.passport?.issueDate}
                    onChange={(e) => updateField('passport', 'issueDate', e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={nextStep}
                    className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-2xl shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] hover:shadow-[0_16px_32px_-8px_rgba(79,70,229,0.6)] hover:scale-[1.02] transition-all"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded">University & Program</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de l'UniversitÃ©</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.university?.universityName}
                    onChange={(e) => updateField('university', 'universityName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Acronyme</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MIT"
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.university?.acronym}
                    onChange={(e) => updateField('university', 'acronym', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Programme/Majeure</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.program?.major}
                    onChange={(e) => updateField('program', 'major', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Niveau d'Ã©tudes</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.program?.degreeLevel}
                    onChange={(e) => updateField('program', 'degreeLevel', e.target.value)}
                  >
                    <option value="">SÃ©lectionner le niveau</option>
                    <option value="Bachelors">Licence (Bachelors)</option>
                    <option value="Masters">Master (Masters)</option>
                    <option value="PhD">Doctorat (PhD)</option>
                  </select>
                </div>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <button onClick={prevStep} className="px-8 py-3 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Back</button>
                  <button onClick={nextStep} className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-2xl shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] hover:scale-[1.02] transition-all">Continue</button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded">Bank Account Details</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Name</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.bank?.bankName}
                    onChange={(e) => updateField('bank', 'bankName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.bankAccount?.accountNumber}
                    onChange={(e) => updateField('bankAccount', 'accountNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">RIB Key</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.bankAccount?.iban}
                    onChange={(e) => updateField('bankAccount', 'iban', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Branch Code</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.bank?.branchCode}
                    onChange={(e) => updateField('bank', 'branchCode', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Branch Address</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.bank?.branchAddress}
                    onChange={(e) => updateField('bank', 'branchAddress', e.target.value)}
                  />
                </div>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <button onClick={prevStep} className="px-8 py-3 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Back</button>
                  <div className="flex items-center gap-6">
                    <button onClick={nextStep} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Skip for now</button>
                    <button onClick={nextStep} className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-2xl shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] hover:scale-[1.02] transition-all">Continue</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 font-rounded">Contact & Address</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.contact?.phone}
                    onChange={(e) => updateField('contact', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.contact?.emergencyContactName}
                    onChange={(e) => updateField('contact', 'emergencyContactName', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Address in Host Country</label>
                  <textarea 
                    className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    rows={3}
                    value={formData.address?.currentHostAddress}
                    onChange={(e) => updateField('address', 'currentHostAddress', e.target.value)}
                  />
                </div>
                <div className="col-span-2 pt-6 flex items-center justify-between">
                  <button onClick={prevStep} className="px-8 py-3 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Back</button>
                  <div className="flex items-center gap-6">
                    <button onClick={handleSubmit} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Skip for now</button>
                    <button onClick={handleSubmit} className="px-12 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-[0_12px_24px_-8px_rgba(16,185,129,0.5)] hover:scale-[1.02] transition-all">Complete Onboarding</button>
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


