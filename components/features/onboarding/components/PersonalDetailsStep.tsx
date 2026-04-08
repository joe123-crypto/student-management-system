import React from 'react';
import { ArrowRight, User as UserIcon } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

type PersonalFieldSection = 'student' | 'passport';

interface PersonalDetailsStepProps {
  student: StudentProfile;
  readOnlyInputClass?: string;
  inputClass?: string;
  mode?: 'read-only' | 'editable';
  onUpdateField?: (section: PersonalFieldSection, field: string, value: string) => void;
  onNext: () => void;
  nextLabel?: string;
}

const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  student,
  readOnlyInputClass = '',
  inputClass = '',
  mode = 'read-only',
  onUpdateField,
  onNext,
  nextLabel = 'Continue',
}) => {
  const isEditable = mode === 'editable';
  const sharedInputClass = isEditable ? inputClass : readOnlyInputClass;

  return (
    <div className="space-y-8">
      <h2 className="theme-heading type-section-title flex items-center gap-2">
        <UserIcon className="h-6 w-6 text-[color:var(--theme-primary-soft)]" />
        Personal & Passport
      </h2>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
        <FormField label="Full Name">
          <input
            type="text"
            className={sharedInputClass}
            value={student.student.fullName}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('student', 'fullName', event.target.value)}
          />
        </FormField>
        <FormField label="Inscription No.">
          <input
            type="text"
            className={sharedInputClass}
            value={student.student.inscriptionNumber}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('student', 'inscriptionNumber', event.target.value)}
          />
        </FormField>
        {isEditable ? (
          <>
            <FormField label="Date of Birth">
              <input
                type="date"
                className={sharedInputClass}
                value={student.student.dateOfBirth}
                onChange={(event) => onUpdateField?.('student', 'dateOfBirth', event.target.value)}
              />
            </FormField>
            <FormField label="Nationality">
              <input
                type="text"
                className={sharedInputClass}
                value={student.student.nationality}
                onChange={(event) => onUpdateField?.('student', 'nationality', event.target.value)}
              />
            </FormField>
            <FormField label="Gender">
              <select
                className={sharedInputClass}
                value={student.student.gender}
                onChange={(event) => onUpdateField?.('student', 'gender', event.target.value)}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
            <FormField label="Issuing Country">
              <input
                type="text"
                className={sharedInputClass}
                value={student.passport.issuingCountry}
                onChange={(event) => onUpdateField?.('passport', 'issuingCountry', event.target.value)}
              />
            </FormField>
          </>
        ) : null}
        <FormField label="Passport Number">
          <input
            type="text"
            className={sharedInputClass}
            value={student.passport.passportNumber}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('passport', 'passportNumber', event.target.value)}
          />
        </FormField>
        <FormField label="Passport Expiry">
          <input
            type="date"
            className={sharedInputClass}
            value={student.passport.expiryDate}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('passport', 'expiryDate', event.target.value)}
          />
        </FormField>
        <FormField label="Passport Issue Date">
          <input
            type="date"
            className={sharedInputClass}
            value={student.passport.issueDate}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('passport', 'issueDate', event.target.value)}
          />
        </FormField>
        <div className="flex justify-end md:col-span-2">
          <Button
            onClick={onNext}
            className="w-full rounded-2xl px-12 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)] md:w-auto"
          >
            <ArrowRight className="w-4 h-4" />
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;
