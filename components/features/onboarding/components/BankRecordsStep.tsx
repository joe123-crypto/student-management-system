import React from 'react';
import { ArrowLeft, ArrowRight, Landmark } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

type OnboardingFormData = Pick<StudentProfile, 'bankAccount' | 'bank'>;

interface BankRecordsStepProps {
  formData: OnboardingFormData;
  inputClass: string;
  onUpdateField: (section: 'bankAccount' | 'bank', field: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const BankRecordsStep: React.FC<BankRecordsStepProps> = ({
  formData,
  inputClass,
  onUpdateField,
  onBack,
  onNext,
}) => (
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
          onChange={(e) => onUpdateField('bank', 'bankName', e.target.value)}
        />
      </FormField>
      <FormField label="Account Number">
        <input
          type="text"
          className={inputClass}
          value={formData.bankAccount.accountNumber}
          onChange={(e) => onUpdateField('bankAccount', 'accountNumber', e.target.value)}
        />
      </FormField>
      <FormField label="RIB Key">
        <input
          type="text"
          className={inputClass}
          value={formData.bankAccount.iban}
          onChange={(e) => onUpdateField('bankAccount', 'iban', e.target.value)}
        />
      </FormField>
      <FormField label="Branch Code">
        <input
          type="text"
          className={inputClass}
          value={formData.bank.branchCode}
          onChange={(e) => onUpdateField('bank', 'branchCode', e.target.value)}
        />
      </FormField>
      <FormField label="Branch Address">
        <input
          type="text"
          className={inputClass}
          value={formData.bank.branchAddress}
          onChange={(e) => onUpdateField('bank', 'branchAddress', e.target.value)}
        />
      </FormField>
      <FormField label="Branch Name">
        <input
          type="text"
          className={inputClass}
          value={formData.bank.branchName}
          onChange={(e) => onUpdateField('bank', 'branchName', e.target.value)}
        />
      </FormField>
      <FormField label="Account Holder Name">
        <input
          type="text"
          className={inputClass}
          value={formData.bankAccount.accountHolderName}
          onChange={(e) => onUpdateField('bankAccount', 'accountHolderName', e.target.value)}
        />
      </FormField>
      <div className="col-span-2 pt-6 flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="secondary"
          className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-6">
          <Button onClick={onNext} variant="ghost" className="text-sm font-bold text-slate-400 hover:text-slate-600">
            Skip for now
          </Button>
          <Button onClick={onNext} className="px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700">
            <ArrowRight className="w-4 h-4" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default BankRecordsStep;
