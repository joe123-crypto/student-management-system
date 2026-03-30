import React from 'react';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

interface AcademicInfoStepProps {
  student: StudentProfile;
  readOnlyInputClass: string;
  onBack: () => void;
  onNext: () => void;
}

const AcademicInfoStep: React.FC<AcademicInfoStepProps> = ({
  student,
  readOnlyInputClass,
  onBack,
  onNext,
}) => (
  <div className="space-y-8">
    <h2 className="theme-heading type-section-title flex items-center gap-2">
      <GraduationCap className="h-6 w-6 text-[color:var(--theme-primary-soft)]" />
      University & Program
    </h2>
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 items-end">
      <FormField label="University Name">
        <input type="text" className={readOnlyInputClass} value={student.university.universityName} readOnly />
      </FormField>
      <FormField label="Acronym">
        <input type="text" className={readOnlyInputClass} value={student.university.acronym} readOnly />
      </FormField>
      <FormField label="Program / Major">
        <input type="text" className={readOnlyInputClass} value={student.program.major} readOnly />
      </FormField>
      <FormField label="Degree Level">
        <input type="text" className={readOnlyInputClass} value={student.program.degreeLevel} readOnly />
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
        <Button
          onClick={onBack}
          variant="secondary"
          className="rounded-2xl px-8 py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          className="rounded-2xl px-12 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)]"
        >
          <ArrowRight className="w-4 h-4" />
          Continue
        </Button>
      </div>
    </div>
  </div>
);

export default AcademicInfoStep;
