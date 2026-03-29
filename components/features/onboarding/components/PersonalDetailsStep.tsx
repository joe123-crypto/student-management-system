import React from 'react';
import { ArrowRight, User as UserIcon } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

interface PersonalDetailsStepProps {
  student: StudentProfile;
  readOnlyInputClass: string;
  onNext: () => void;
}

const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({ student, readOnlyInputClass, onNext }) => (
  <div className="space-y-8">
    <h2 className="theme-heading font-rounded flex items-center gap-2 text-2xl font-bold">
      <UserIcon className="h-6 w-6 text-[color:var(--theme-primary-soft)]" />
      Personal & Passport
    </h2>
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
      <FormField label="Full Name">
        <input type="text" className={readOnlyInputClass} value={student.student.fullName} readOnly />
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
        <input type="date" className={readOnlyInputClass} value={student.passport.expiryDate} readOnly />
      </FormField>
      <FormField label="Passport Issue Date">
        <input type="date" className={readOnlyInputClass} value={student.passport.issueDate} readOnly />
      </FormField>
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="w-full rounded-2xl px-12 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)] md:w-auto"
        >
          <ArrowRight className="w-4 h-4" />
          Continue
        </Button>
      </div>
    </div>
  </div>
);

export default PersonalDetailsStep;
