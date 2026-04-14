import React from 'react';
import { CalendarDays, IdCard, Mail } from 'lucide-react';
import { StudentProfile } from '@/types';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';
import StatusBadge from '@/components/ui/StatusBadge';

interface StudentProfilePanelProps {
  student: StudentProfile | null;
  currentPicture?: string;
  loading?: boolean;
  onProfilePictureChange: (file: File) => void | Promise<void>;
  onProfilePictureRemove: () => void;
  isUploadingProfilePicture?: boolean;
}

const surfaceCardClass =
  'theme-card relative overflow-hidden rounded-[2.25rem] border bg-[linear-gradient(180deg,rgba(252,248,234,0.98),rgba(247,241,221,0.9))] shadow-[0_22px_50px_rgba(37,79,34,0.08)]';
const fieldCardClass =
  'min-w-0 rounded-[1.35rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4';
const fieldLabelClass = 'theme-text-muted type-label';
const fieldValueClass = 'theme-heading mt-2 break-words text-base font-semibold leading-tight';
const heroSummaryGridClass = 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3';

function formatValue(value?: string | null) {
  return value && value.trim() ? value : '---';
}

const StudentProfilePanel: React.FC<StudentProfilePanelProps> = ({
  student,
  currentPicture,
  loading = false,
  onProfilePictureChange,
  onProfilePictureRemove,
  isUploadingProfilePicture = false,
}) => {
  if (loading || !student) {
    return (
      <div className="animate-pulse">
        <div className={`${surfaceCardClass} px-6 py-7 md:px-8 md:py-8`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-6 md:flex-row md:flex-wrap md:items-start">
              <div className="h-32 w-32 rounded-[2.5rem] bg-[rgba(220,205,166,0.55)]" />
              <div className="w-full flex-1 space-y-3 md:min-w-[18rem]">
                <div className="h-4 w-28 rounded bg-[rgba(220,205,166,0.38)]" />
                <div className="h-10 w-72 rounded bg-[rgba(220,205,166,0.56)]" />
                <div className="h-5 w-80 rounded bg-[rgba(220,205,166,0.34)]" />
                <div className={heroSummaryGridClass}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-[1.35rem] bg-[rgba(220,205,166,0.32)]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const programLine = [student.program.major, student.university.universityName]
    .filter(Boolean)
    .join(' at ');

  return (
    <div className={`${surfaceCardClass} px-6 py-7 md:px-8 md:py-8`}>
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgba(37,79,34,0.08)] blur-3xl" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-6 md:flex-row md:items-start">
          <ProfilePictureUpload
            imageSrc={currentPicture}
            onChange={onProfilePictureChange}
            onRemove={onProfilePictureRemove}
            isUploading={isUploadingProfilePicture}
            className="shrink-0 self-start md:max-w-[15rem]"
          />
          <div className="w-full flex-1 space-y-4 md:min-w-[22rem]">
            <div className="min-w-0 space-y-2">
              <p className="theme-text-muted type-label">My profile</p>
              <h4 className="theme-heading type-page-title break-words">
                {student.student.fullName}
              </h4>
              <p className="theme-text-muted type-body max-w-3xl break-words">
                {programLine || 'Your academic and identity records will appear here once available.'}
              </p>
            </div>

            <div className={heroSummaryGridClass}>
              <div className={fieldCardClass}>
                <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                  <Mail className="h-4 w-4 shrink-0" />
                  <p className={fieldLabelClass}>Email address</p>
                </div>
                <p className="mt-2 break-all text-base font-semibold leading-tight text-[color:var(--theme-text)]">
                  {formatValue(student.contact.email)}
                </p>
              </div>

              <div className={fieldCardClass}>
                <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                  <IdCard className="h-4 w-4 shrink-0" />
                  <p className={fieldLabelClass}>Inscription number</p>
                </div>
                <p className="mt-2 break-all font-mono text-base font-semibold text-[color:var(--theme-primary)]">
                  {formatValue(student.student.inscriptionNumber)}
                </p>
              </div>

              <div className={fieldCardClass}>
                <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <p className={fieldLabelClass}>Expected completion</p>
                </div>
                <p className={fieldValueClass}>{formatValue(student.program.expectedEndDate)}</p>
              </div>

              <div className={fieldCardClass}>
                <p className={fieldLabelClass}>Status</p>
                <div className="mt-3">
                  <StatusBadge status={student.status} className="px-3 py-1.5 text-[11px] font-semibold" />
                </div>
              </div>

              <div className={fieldCardClass}>
                <p className={fieldLabelClass}>Level</p>
                <p className={fieldValueClass}>{formatValue(student.program.degreeLevel)}</p>
              </div>

              <div className={fieldCardClass}>
                <p className={fieldLabelClass}>Campus</p>
                <p className={fieldValueClass}>{formatValue(student.university.campus)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePanel;
