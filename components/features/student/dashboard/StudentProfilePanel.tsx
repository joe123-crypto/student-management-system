import React from 'react';
import { StudentProfile } from '@/types';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';

interface StudentProfilePanelProps {
  student: StudentProfile;
  currentPicture?: string;
  loading?: boolean;
  onProfilePictureChange: (base64: string) => void;
  onProfilePictureRemove: () => void;
}

const tinyLabelClass = 'mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400';
const infoValueClass = 'text-lg font-semibold text-slate-900';

const StudentProfilePanel: React.FC<StudentProfilePanelProps> = ({
  student,
  currentPicture,
  loading = false,
  onProfilePictureChange,
  onProfilePictureRemove,
}) => {
  if (loading) {
    return (
      <div className="space-y-7 animate-pulse">
        <div className="flex justify-end">
          <div className="h-7 w-28 rounded-full bg-slate-200" />
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white px-7 py-8 shadow-sm md:px-10 md:py-10">
          <div className="flex flex-col items-start gap-7 md:flex-row md:items-center">
            <div className="h-24 w-24 rounded-2xl bg-slate-200" />
            <div className="space-y-3">
              <div className="h-6 w-56 rounded bg-slate-200" />
              <div className="h-5 w-72 rounded bg-slate-100" />
              <div className="h-5 w-64 rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-7">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-5 w-28 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
            <div className="h-5 w-48 rounded bg-slate-200" />
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="h-5 w-48 rounded bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="h-5 w-44 rounded bg-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-slate-100" />
                  <div className="h-5 w-20 rounded bg-slate-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-slate-100" />
                  <div className="h-5 w-24 rounded bg-slate-200" />
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
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-emerald-700">
          {student.status}
        </span>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white px-7 py-8 shadow-sm md:px-10 md:py-10">
        <div className="flex flex-col items-start gap-7 md:flex-row md:items-center">
          <ProfilePictureUpload
            imageSrc={currentPicture}
            onChange={onProfilePictureChange}
            onRemove={onProfilePictureRemove}
          />
          <div className="space-y-2">
            <h4 className="text-2xl font-bold tracking-tight text-[#101942]">{student.student.fullName}</h4>
            <p className="text-xl font-medium text-slate-600">
              Inscription Number:{' '}
              <span className="font-mono text-lg font-semibold text-indigo-600">
                {student.student.inscriptionNumber}
              </span>
            </p>
            <p className="text-xl font-medium text-slate-600">{student.contact.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-8 w-2 rounded-full bg-indigo-600" />
            <h5 className="text-base font-black uppercase tracking-[0.16em] text-slate-500">Personal Identity</h5>
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

        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-8 w-2 rounded-full bg-emerald-500" />
            <h5 className="text-base font-black uppercase tracking-[0.16em] text-slate-500">
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
