import React from 'react';
import { ProgressDetails } from '@/types';
import FormField from '@/components/ui/FormField';
import FileUploadDropzone from '@/components/ui/FileUploadDropzone';
import Button from '@/components/ui/Button';

interface StudentAcademicUpdateFormProps {
  newProgress: Partial<ProgressDetails>;
  inputClassName: string;
  onFieldChange: (field: 'year' | 'level' | 'grade' | 'proofDocument', value: string) => void;
  onProofDocumentUpload: (file: File) => void | Promise<void>;
  onBack: () => void;
  onSubmit: () => void;
  isUploadingProofDocument?: boolean;
}

const StudentAcademicUpdateForm: React.FC<StudentAcademicUpdateFormProps> = ({
  newProgress,
  inputClassName,
  onFieldChange,
  onProofDocumentUpload,
  onBack,
  onSubmit,
  isUploadingProofDocument = false,
}) => {
  return (
    <div className="theme-card relative min-h-[500px] overflow-hidden rounded-[2.5rem] border p-10 transition-all">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h4 className="theme-heading font-rounded text-2xl font-black">Upload Progress Details</h4>
        </div>
      </div>

      <div className="animate-fade-in space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            label="Academic Year"
            labelClassName="theme-text-muted mb-3 block text-xs font-black uppercase tracking-widest"
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
          <FormField label="Level" labelClassName="theme-text-muted mb-3 block text-xs font-black uppercase tracking-widest">
            <input
              placeholder="e.g. L1, M2"
              value={newProgress.level}
              onChange={(e) => onFieldChange('level', e.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField
            label="Final Grade (/20)"
            labelClassName="theme-text-muted mb-3 block text-xs font-black uppercase tracking-widest"
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
          labelClassName="theme-text-muted mb-3 block text-xs font-black uppercase tracking-widest"
        >
          <FileUploadDropzone
            value={newProgress.proofDocument}
            onChange={onProofDocumentUpload}
            onClear={() => onFieldChange('proofDocument', '')}
            emptyTitle="Drop your transcript here"
            emptySubtitle="Or click to browse (PDF only)"
            accept=".pdf,application/pdf"
            isUploading={isUploadingProofDocument}
          />
        </FormField>

        <div className="flex items-center justify-between border-t border-[rgba(220,205,166,0.55)] pt-6">
          <Button variant="secondary" onClick={onBack}>
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
