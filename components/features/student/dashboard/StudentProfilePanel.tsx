import React from 'react';
import { GraduationCap, IdCard, Mail, UserRound } from 'lucide-react';
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
  'min-w-0 rounded-[1.4rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.4)] px-4 py-4';
const fieldLabelClass = 'theme-text-muted text-xs font-medium leading-snug tracking-[0.04em]';
const fieldValueClass = 'theme-heading mt-2 break-words text-lg font-semibold leading-tight';
const fieldValueStrongClass = 'theme-heading mt-2 break-words text-[1.35rem] font-bold leading-tight';
const heroSummaryGridClass = 'grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3';

interface ProfileSectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function ProfileSectionHeader({ icon: Icon, title, description }: ProfileSectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,79,34,0.1)] text-[color:var(--theme-primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h5 className="theme-heading text-sm font-bold tracking-[0.04em]">{title}</h5>
        <p className="theme-text-muted text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  emphasis?: 'default' | 'strong';
  mono?: boolean;
}

function ProfileField({ label, value, emphasis = 'default', mono = false }: ProfileFieldProps) {
  return (
    <div className={fieldCardClass}>
      <p className={fieldLabelClass}>{label}</p>
      <p
        className={[
          emphasis === 'strong' ? fieldValueStrongClass : fieldValueClass,
          mono ? 'break-all font-mono text-base font-semibold text-[color:var(--theme-primary)]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </p>
    </div>
  );
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
      <div className="space-y-7 animate-pulse">
        <div className={`${surfaceCardClass} px-6 py-7 md:px-8 md:py-8`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:flex-wrap xl:items-start xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-6 md:flex-row md:flex-wrap md:items-start">
              <div className="h-24 w-24 rounded-[2rem] bg-[rgba(220,205,166,0.6)]" />
              <div className="w-full flex-1 space-y-3 md:min-w-[18rem]">
                <div className="h-4 w-28 rounded bg-[rgba(220,205,166,0.34)]" />
                <div className="h-8 w-64 rounded bg-[rgba(220,205,166,0.6)]" />
                <div className="h-5 w-72 rounded bg-[rgba(220,205,166,0.34)]" />
                <div className={heroSummaryGridClass}>
                  <div className="h-16 rounded-[1.4rem] bg-[rgba(220,205,166,0.32)]" />
                  <div className="h-16 rounded-[1.4rem] bg-[rgba(220,205,166,0.32)]" />
                </div>
              </div>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3 xl:w-auto xl:min-w-[17rem] xl:grid-cols-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 rounded-[1.4rem] bg-[rgba(220,205,166,0.32)]" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className={`${surfaceCardClass} p-6 md:p-7`}>
            <div className="mb-6 flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[rgba(220,205,166,0.32)]" />
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-[rgba(220,205,166,0.6)]" />
                <div className="h-4 w-52 rounded bg-[rgba(220,205,166,0.34)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 rounded-[1.4rem] bg-[rgba(220,205,166,0.32)]" />
              ))}
            </div>
          </div>
          <div className={`${surfaceCardClass} p-6 md:p-7`}>
            <div className="mb-6 flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[rgba(220,205,166,0.32)]" />
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-[rgba(220,205,166,0.6)]" />
                <div className="h-4 w-48 rounded bg-[rgba(220,205,166,0.34)]" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-20 rounded-[1.4rem] bg-[rgba(220,205,166,0.32)] sm:col-span-2" />
              <div className="h-20 rounded-[1.4rem] bg-[rgba(220,205,166,0.32)] sm:col-span-2" />
              <div className="h-20 rounded-[1.4rem] bg-[rgba(220,205,166,0.32)]" />
              <div className="h-20 rounded-[1.4rem] bg-[rgba(220,205,166,0.32)]" />
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
    <div className="space-y-7">
      <div className={`${surfaceCardClass} px-6 py-7 md:px-8 md:py-8`}>
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgba(37,79,34,0.08)] blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:flex-wrap xl:items-start xl:justify-between xl:gap-8">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-6 md:flex-row md:flex-wrap md:items-start">
            <ProfilePictureUpload
              imageSrc={currentPicture}
              onChange={onProfilePictureChange}
              onRemove={onProfilePictureRemove}
              isUploading={isUploadingProfilePicture}
              className="shrink-0 self-start md:max-w-[15rem]"
            />
            <div className="w-full flex-1 space-y-4 md:min-w-[18rem]">
              <div className="min-w-0 space-y-2">
                <p className="theme-text-muted text-sm font-medium tracking-[0.08em]">Student profile</p>
                <h4 className="theme-heading font-rounded break-words text-3xl font-black tracking-tight md:text-4xl">
                  {student.student.fullName}
                </h4>
                <p className="theme-text-muted max-w-2xl break-words text-base leading-relaxed md:text-lg">
                  {programLine || 'Program and university details will appear here once available.'}
                </p>
              </div>

              <div className={heroSummaryGridClass}>
                <div className={fieldCardClass}>
                  <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                    <IdCard className="h-4 w-4 shrink-0" />
                    <p className={fieldLabelClass}>Inscription number</p>
                  </div>
                  <p className="mt-2 break-all font-mono text-base font-semibold text-[color:var(--theme-primary)]">
                    {student.student.inscriptionNumber || '---'}
                  </p>
                </div>
                <div className={fieldCardClass}>
                  <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                    <Mail className="h-4 w-4 shrink-0" />
                    <p className={fieldLabelClass}>Email address</p>
                  </div>
                  <p className="mt-2 break-all text-base font-semibold leading-tight text-[color:var(--theme-text)]">
                    {student.contact.email || '---'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 xl:w-auto xl:min-w-[17rem] xl:grid-cols-1">
            <div className={fieldCardClass}>
              <p className={fieldLabelClass}>Status</p>
              <div className="mt-3">
                <StatusBadge status={student.status} className="px-3 py-1.5 text-[11px] font-semibold" />
              </div>
            </div>
            <div className={fieldCardClass}>
              <p className={fieldLabelClass}>Level</p>
              <p className={fieldValueClass}>{student.program.degreeLevel || '---'}</p>
            </div>
            <div className={fieldCardClass}>
              <p className={fieldLabelClass}>Campus</p>
              <p className={fieldValueClass}>{student.university.campus || '---'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={`${surfaceCardClass} p-6 md:p-7`}>
          <ProfileSectionHeader
            icon={UserRound}
            title="Personal identity"
            description="Core identity details used across your student record."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileField label="Given name" value={student.student.givenName || '---'} />
            <ProfileField label="Family name" value={student.student.familyName || '---'} />
            <ProfileField label="Date of birth" value={student.student.dateOfBirth || '---'} />
            <ProfileField label="Nationality" value={student.student.nationality || '---'} emphasis="strong" />
          </div>
        </div>

        <div className={`${surfaceCardClass} p-6 md:p-7`}>
          <ProfileSectionHeader
            icon={GraduationCap}
            title="University and program"
            description="The primary academic details that should stand out at a glance."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ProfileField
                label="University"
                value={student.university.universityName || '---'}
                emphasis="strong"
              />
            </div>
            <div className="sm:col-span-2">
              <ProfileField label="Program" value={student.program.major || '---'} emphasis="strong" />
            </div>
            <ProfileField label="Level" value={student.program.degreeLevel || '---'} />
            <ProfileField label="Campus" value={student.university.campus || '---'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePanel;
