import React from 'react';
import { ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StudentProfile } from '@/types';
import {
  ProfileSectionId,
  StudentProfileSectionDetailsCard,
  getProfileSection,
} from '@/components/features/student/dashboard/StudentProfileSectionDetailsCard';

interface StudentProfileSectionPageProps {
  student: StudentProfile;
  sectionId: ProfileSectionId;
  editData?: StudentProfile | null;
  isEditing?: boolean;
  isSaving?: boolean;
  inputClassName?: string;
  onBack: () => void;
  onToggleEdit?: () => void;
  onDiscard?: () => void;
  onSave?: () => void;
  onUpdateField?: (section: keyof StudentProfile, field: string, value: unknown) => void;
}

const pageIntroClass =
  'theme-card rounded-[2rem] border border-[rgba(220,205,166,0.72)] bg-[rgba(255,255,255,0.7)] p-5 sm:p-6';

export default function StudentProfileSectionPage({
  student,
  sectionId,
  editData,
  isEditing = false,
  isSaving = false,
  inputClassName,
  onBack,
  onToggleEdit,
  onDiscard,
  onSave,
  onUpdateField,
}: StudentProfileSectionPageProps) {
  const selectedSection = getProfileSection(sectionId);

  return (
    <div className="space-y-6 pb-24">
      <div className={pageIntroClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="theme-text-muted type-label">Profile section</p>
            <h3 className="theme-heading type-page-title">{selectedSection.title}</h3>
            <p className="theme-text-muted type-body max-w-2xl">
              This view shows only the student details for the selected section.
            </p>
          </div>

          <Button variant="secondary" onClick={onBack} className="inline-flex items-center gap-2 rounded-full">
            <ChevronLeft className="h-4 w-4" />
            Back to overview
          </Button>
        </div>
      </div>

      <StudentProfileSectionDetailsCard
        student={student}
        sectionId={sectionId}
        editData={editData}
        isEditing={isEditing}
        isSaving={isSaving}
        inputClassName={inputClassName}
        onToggleEdit={onToggleEdit}
        onDiscard={onDiscard}
        onSave={onSave}
        onUpdateField={onUpdateField}
      />
    </div>
  );
}
