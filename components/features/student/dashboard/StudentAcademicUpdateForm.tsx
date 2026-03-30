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
    <div className="theme-card relative min-h-[500px] overflow-hidden rounded-[2.5rem] border p-6 transition-all sm:p-10">
      <div className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
        <div className="max-w-2xl">
          <p className="theme-text-muted type-label mb-2">Academic Update</p>
          <h4 className="theme-heading type-section-title">Upload Progress Details</h4>
          <p className="theme-text-muted type-body-sm mt-3">
            Share the latest verified result so your record stays current and easy to review.
          </p>
        </div>
      </div>

      <div className="animate-fade-in space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            label="Academic Year"
            labelClassName="mb-3"
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
          <FormField label="Level" labelClassName="mb-3">
            <input
              placeholder="e.g. L1, M2"
              value={newProgress.level}
              onChange={(e) => onFieldChange('level', e.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField
            label="Final Grade (/20)"
            labelClassName="mb-3"
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
          labelClassName="mb-3"
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
