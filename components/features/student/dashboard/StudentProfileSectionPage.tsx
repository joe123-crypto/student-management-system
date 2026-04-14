import React from 'react';
import { StudentProfile } from '@/types';
import {
  ProfileSectionId,
  StudentProfileSectionDetailsCard,
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
  return (
    <div className="pb-24">
      <StudentProfileSectionDetailsCard
        student={student}
        sectionId={sectionId}
        editData={editData}
        isEditing={isEditing}
        isSaving={isSaving}
        inputClassName={inputClassName}
        onBack={onBack}
        onToggleEdit={onToggleEdit}
        onDiscard={onDiscard}
        onSave={onSave}
        onUpdateField={onUpdateField}
      />
    </div>
  );
}
