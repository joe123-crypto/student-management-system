import React from 'react';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

type AcademicFieldSection = 'university' | 'program';

interface AcademicInfoStepProps {
  student: StudentProfile;
  readOnlyInputClass?: string;
  inputClass?: string;
  mode?: 'read-only' | 'editable';
  onUpdateField?: (section: AcademicFieldSection, field: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}

const AcademicInfoStep: React.FC<AcademicInfoStepProps> = ({
  student,
  readOnlyInputClass = '',
  inputClass = '',
  mode = 'read-only',
  onUpdateField,
  onBack,
  onNext,
  nextLabel = 'Continue',
}) => {
  const isEditable = mode === 'editable';
  const sharedInputClass = isEditable ? inputClass : readOnlyInputClass;

  return (
    <div className="space-y-8">
      <h2 className="theme-heading type-section-title flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-[color:var(--theme-primary-soft)]" />
        University & Program
      </h2>
      <div className="grid grid-cols-1 gap-y-6 items-end md:grid-cols-2 md:gap-x-8">
        <FormField label="University Name">
          <input
            type="text"
            className={sharedInputClass}
            value={student.university.universityName}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('university', 'universityName', event.target.value)}
          />
        </FormField>
        <FormField label="Acronym">
          <input
            type="text"
            className={sharedInputClass}
            value={student.university.acronym}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('university', 'acronym', event.target.value)}
          />
        </FormField>
        {isEditable ? (
          <>
            <FormField label="Campus">
              <input
                type="text"
                className={sharedInputClass}
                value={student.university.campus}
                onChange={(event) => onUpdateField?.('university', 'campus', event.target.value)}
              />
            </FormField>
            <FormField label="City">
              <input
                type="text"
                className={sharedInputClass}
                value={student.university.city}
                onChange={(event) => onUpdateField?.('university', 'city', event.target.value)}
              />
            </FormField>
          </>
        ) : null}
        <FormField label="Program / Major">
          <input
            type="text"
            className={sharedInputClass}
            value={student.program.major}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('program', 'major', event.target.value)}
          />
        </FormField>
        <FormField label="Degree Level">
          <input
            type="text"
            className={sharedInputClass}
            value={student.program.degreeLevel}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('program', 'degreeLevel', event.target.value)}
          />
        </FormField>
        <FormField label="Department" className={isEditable ? '' : 'md:col-span-2'}>
          <input
            type="text"
            className={sharedInputClass}
            value={student.university.department || (isEditable ? '' : 'N/A')}
            readOnly={!isEditable}
            onChange={(event) => onUpdateField?.('university', 'department', event.target.value)}
          />
        </FormField>
        {isEditable ? (
          <>
            <FormField label="Program Start Date">
              <input
                type="date"
                className={sharedInputClass}
                value={student.program.startDate}
                onChange={(event) => onUpdateField?.('program', 'startDate', event.target.value)}
              />
            </FormField>
            <FormField label="Expected End Date" className="md:col-span-2">
              <input
                type="date"
                className={sharedInputClass}
                value={student.program.expectedEndDate}
                onChange={(event) => onUpdateField?.('program', 'expectedEndDate', event.target.value)}
              />
            </FormField>
          </>
        ) : null}
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 pt-6 md:col-span-2 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <Button
            onClick={onBack}
            variant="secondary"
            className="min-w-0 justify-center rounded-2xl px-4 py-3 sm:w-auto sm:px-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={onNext}
            className="min-w-0 justify-center rounded-2xl px-4 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)] sm:w-auto sm:px-12"
          >
            <ArrowRight className="w-4 h-4" />
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AcademicInfoStep;
