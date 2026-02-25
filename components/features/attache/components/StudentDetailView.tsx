import React from 'react';
import type { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import AcademicHistoryItem from '@/components/ui/AcademicHistoryItem';

interface StudentDetailViewProps {
  student: StudentProfile;
  onBack: () => void;
}

export default function StudentDetailView({ student, onBack }: StudentDetailViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-600 hover:bg-slate-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Student Records
        </Button>
        <StatusBadge status={student.status} />
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-28 h-28 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
          {student.student.profilePicture ? (
            <img src={student.student.profilePicture} alt={`${student.student.fullName} profile`} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-slate-400">{student.student.fullName.charAt(0)}</span>
          )}
        </div>
        <div className="text-center md:text-left space-y-2">
          <h4 className="text-3xl font-black text-[#1a1b3a] font-rounded">{student.student.fullName}</h4>
          <p className="text-slate-500 font-medium">
            Inscription Number: <span className="font-mono font-bold text-indigo-600">{student.student.inscriptionNumber}</span>
          </p>
          <p className="text-slate-500 font-medium">{student.contact.email}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
          <SectionHeader title="Personal Identity" accent="indigo" />
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Given Name</p>
              <p className="font-bold text-slate-800">{student.student.givenName || '---'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Family Name</p>
              <p className="font-bold text-slate-800">{student.student.familyName || '---'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Date of Birth</p>
              <p className="font-bold text-slate-800">{student.student.dateOfBirth || '---'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nationality</p>
              <p className="font-bold text-slate-800">{student.student.nationality || '---'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
          <SectionHeader title="University & Program" accent="emerald" />
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">University</p>
              <p className="font-bold text-slate-800">{student.university.universityName}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Program</p>
              <p className="font-bold text-slate-800">{student.program.major}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Level</p>
                <p className="font-bold text-slate-800">{student.program.degreeLevel || '---'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Campus</p>
                <p className="font-bold text-slate-800">{student.university.campus || '---'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
        <SectionHeader title="Contact & Banking" accent="amber" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Phone</p>
            <p className="font-bold text-slate-800">{student.contact.phone || '---'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Emergency Contact</p>
            <p className="font-bold text-slate-800">{student.contact.emergencyContactName || '---'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Bank</p>
            <p className="font-bold text-slate-800">{student.bank.bankName || '---'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">RIB / IBAN</p>
            <p className="font-mono font-bold text-slate-800 break-all">{student.bankAccount.iban || '---'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
        <SectionHeader title="Academic Progress" accent="indigo" />
        {student.academicHistory && student.academicHistory.length > 0 ? (
          <div className="space-y-4">
            {student.academicHistory.map((entry) => (
              <AcademicHistoryItem key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No academic submissions found for this student.</p>
        )}
      </div>
    </div>
  );
}

