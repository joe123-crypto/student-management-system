import React from 'react';
import { ProgressDetails } from '@/types';
import FormField from '@/components/ui/FormField';
import FileUploadDropzone from '@/components/ui/FileUploadDropzone';
import Button from '@/components/ui/Button';

interface StudentAcademicUpdateFormProps {
  newProgress: Partial<ProgressDetails>;
  inputClassName: string;
  onFieldChange: (field: 'year' | 'level' | 'grade' | 'proofDocument', value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const StudentAcademicUpdateForm: React.FC<StudentAcademicUpdateFormProps> = ({
  newProgress,
  inputClassName,
  onFieldChange,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm transition-all">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h4 className="font-rounded text-2xl font-black text-[#1a1b3a]">Upload Progress Details</h4>
        </div>
      </div>

      <div className="animate-fade-in space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            label="Academic Year"
            labelClassName="mb-3 block text-xs font-black uppercase tracking-widest text-slate-400"
          >
            <select
              value={newProgress.year}
              onChange={(e) => onFieldChange('year', e.target.value)}
              className={inputClassName}
            >
              <option value="">Select Year</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
              <option value="Year 5">Year 5</option>
            </select>
          </FormField>
          <FormField label="Level" labelClassName="mb-3 block text-xs font-black uppercase tracking-widest text-slate-400">
            <input
              placeholder="e.g. L1, M2"
              value={newProgress.level}
              onChange={(e) => onFieldChange('level', e.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField
            label="Final Grade (/20)"
            labelClassName="mb-3 block text-xs font-black uppercase tracking-widest text-slate-400"
          >
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={newProgress.grade}
              onChange={(e) => onFieldChange('grade', e.target.value)}
              className={inputClassName}
            />
          </FormField>
        </div>

        <FormField
          label="Proof of Result (Transcript)"
          labelClassName="mb-3 block text-xs font-black uppercase tracking-widest text-slate-400"
        >
          <FileUploadDropzone
            value={newProgress.proofDocument}
            onChange={(base64) => onFieldChange('proofDocument', base64)}
            onClear={() => onFieldChange('proofDocument', '')}
            emptyTitle="Drop your transcript here"
            emptySubtitle="Or click to browse (PDF, PNG, JPG)"
          />
        </FormField>

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <Button variant="secondary" onClick={onBack} className="border-2 border-slate-200 text-slate-600">
            Back
          </Button>
          <Button onClick={onSubmit} className="rounded-2xl px-12 py-4">
            Submit for Validation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentAcademicUpdateForm;
