import React from 'react';
import { StudentProfile } from '@/types';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';

interface StudentProfilePanelProps {
  student: StudentProfile | null;
  currentPicture?: string;
  loading?: boolean;
  onProfilePictureChange: (file: File) => void | Promise<void>;
  onProfilePictureRemove: () => void;
  isUploadingProfilePicture?: boolean;
}

const tinyLabelClass = 'theme-text-muted mb-2 block text-[10px] font-black uppercase tracking-[0.2em]';
const infoValueClass = 'theme-heading text-lg font-semibold';

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
        <div className="flex justify-end">
          <div className="h-7 w-28 rounded-full bg-[rgba(220,205,166,0.6)]" />
        </div>

        <div className="theme-card rounded-[2rem] border px-7 py-8 md:px-10 md:py-10">
          <div className="flex flex-col items-start gap-7 md:flex-row md:items-center">
            <div className="h-24 w-24 rounded-2xl bg-[rgba(220,205,166,0.6)]" />
            <div className="space-y-3">
              <div className="h-6 w-56 rounded bg-[rgba(220,205,166,0.6)]" />
              <div className="h-5 w-72 rounded bg-[rgba(220,205,166,0.34)]" />
              <div className="h-5 w-64 rounded bg-[rgba(220,205,166,0.34)]" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="theme-card space-y-6 rounded-[2rem] border p-7 md:p-8">
            <div className="h-5 w-40 rounded bg-[rgba(220,205,166,0.6)]" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-7">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3 w-24 rounded bg-[rgba(220,205,166,0.34)]" />
                  <div className="h-5 w-28 rounded bg-[rgba(220,205,166,0.6)]" />
                </div>
              ))}
            </div>
          </div>
          <div className="theme-card space-y-6 rounded-[2rem] border p-7 md:p-8">
            <div className="h-5 w-48 rounded bg-[rgba(220,205,166,0.6)]" />
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-[rgba(220,205,166,0.34)]" />
                <div className="h-5 w-48 rounded bg-[rgba(220,205,166,0.6)]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-[rgba(220,205,166,0.34)]" />
                <div className="h-5 w-44 rounded bg-[rgba(220,205,166,0.6)]" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-[rgba(220,205,166,0.34)]" />
                  <div className="h-5 w-20 rounded bg-[rgba(220,205,166,0.6)]" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-[rgba(220,205,166,0.34)]" />
                  <div className="h-5 w-24 rounded bg-[rgba(220,205,166,0.6)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex justify-end">
        <span className="theme-success inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wide">
          {student.status}
        </span>
      </div>

      <div className="theme-card rounded-[2rem] border px-7 py-8 md:px-10 md:py-10">
        <div className="flex flex-col items-start gap-7 md:flex-row md:items-center">
          <ProfilePictureUpload
            imageSrc={currentPicture}
            onChange={onProfilePictureChange}
            onRemove={onProfilePictureRemove}
            isUploading={isUploadingProfilePicture}
          />
          <div className="space-y-2">
            <h4 className="theme-heading text-2xl font-bold tracking-tight">{student.student.fullName}</h4>
            <p className="theme-text-muted text-xl font-medium">
              Inscription Number:{' '}
              <span className="font-mono text-lg font-semibold text-[color:var(--theme-primary-soft)]">
                {student.student.inscriptionNumber}
              </span>
            </p>
            <p className="theme-text-muted text-xl font-medium">{student.contact.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="theme-card rounded-[2rem] border p-7 md:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-8 w-2 rounded-full bg-[color:var(--theme-primary)]" />
            <h5 className="theme-text-muted text-base font-black uppercase tracking-[0.16em]">Personal Identity</h5>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-7">
            <div>
              <p className={tinyLabelClass}>Given Name</p>
              <p className={infoValueClass}>{student.student.givenName || '---'}</p>
            </div>
            <div>
              <p className={tinyLabelClass}>Family Name</p>
              <p className={infoValueClass}>{student.student.familyName || '---'}</p>
            </div>
            <div>
              <p className={tinyLabelClass}>Date of Birth</p>
              <p className={infoValueClass}>{student.student.dateOfBirth || '---'}</p>
            </div>
            <div>
              <p className={tinyLabelClass}>Nationality</p>
              <p className={infoValueClass}>{student.student.nationality || '---'}</p>
            </div>
          </div>
        </div>

        <div className="theme-card rounded-[2rem] border p-7 md:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-8 w-2 rounded-full bg-[color:var(--theme-primary-soft)]" />
            <h5 className="theme-text-muted text-base font-black uppercase tracking-[0.16em]">
              University & Program
            </h5>
          </div>
          <div className="space-y-6">
            <div>
              <p className={tinyLabelClass}>University</p>
              <p className={infoValueClass}>{student.university.universityName || '---'}</p>
            </div>
            <div>
              <p className={tinyLabelClass}>Program</p>
              <p className={infoValueClass}>{student.program.major || '---'}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className={tinyLabelClass}>Level</p>
                <p className={infoValueClass}>{student.program.degreeLevel || '---'}</p>
              </div>
              <div>
                <p className={tinyLabelClass}>Campus</p>
                <p className={infoValueClass}>{student.university.campus || '---'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePanel;
