import React from 'react';
import type { StudentProfile } from '@/types';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import AcademicHistoryItem from '@/components/ui/AcademicHistoryItem';

interface StudentDetailViewProps {
  student: StudentProfile;
  onBack: () => void;
}

function getAcademicOrderValue(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export default function StudentDetailView({ student, onBack }: StudentDetailViewProps) {
  const sortedAcademicHistory = [...(student.academicHistory || [])].sort((left, right) => {
    const yearDelta = getAcademicOrderValue(left.year) - getAcademicOrderValue(right.year);
    if (yearDelta !== 0) {
      return yearDelta;
    }

    return getAcademicOrderValue(left.level) - getAcademicOrderValue(right.level);
  });

  const academicChartData = sortedAcademicHistory.map((entry) => ({
    label: entry.year,
    fullLabel: `${entry.year} - ${entry.level}`,
    grade: Number(entry.grade),
  }));

  const latestAcademicEntry = sortedAcademicHistory[sortedAcademicHistory.length - 1];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="theme-text-muted hover:bg-[rgba(237,228,194,0.24)]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Student Records
        </Button>
        <StatusBadge status={student.status} />
      </div>

      <div className="theme-card flex flex-col items-center gap-8 rounded-[2rem] border p-8 md:flex-row">
        <div className="theme-card-muted flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border">
          {student.student.profilePicture ? (
            <img
              src={student.student.profilePicture}
              alt={`${student.student.fullName} profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="theme-text-muted text-3xl font-black">
              {student.student.fullName.charAt(0)}
            </span>
          )}
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="theme-heading font-rounded text-3xl font-black">{student.student.fullName}</h4>
          <p className="theme-text-muted font-medium">
            Inscription Number:{' '}
            <span className="font-mono font-bold text-[color:var(--theme-primary-soft)]">
              {student.student.inscriptionNumber}
            </span>
          </p>
          <p className="theme-text-muted font-medium">{student.contact.email}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="theme-card space-y-6 rounded-[2rem] border p-8">
          <SectionHeader title="Personal Identity" accent="indigo" />
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Given Name</p>
              <p className="theme-heading font-bold">{student.student.givenName || '---'}</p>
            </div>
            <div>
              <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Family Name</p>
              <p className="theme-heading font-bold">{student.student.familyName || '---'}</p>
            </div>
            <div>
              <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Date of Birth</p>
              <p className="theme-heading font-bold">{student.student.dateOfBirth || '---'}</p>
            </div>
            <div>
              <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Nationality</p>
              <p className="theme-heading font-bold">{student.student.nationality || '---'}</p>
            </div>
          </div>
        </div>

        <div className="theme-card space-y-6 rounded-[2rem] border p-8">
          <SectionHeader title="University & Program" accent="emerald" />
          <div className="space-y-4 text-sm">
            <div>
              <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">University</p>
              <p className="theme-heading font-bold">{student.university.universityName}</p>
            </div>
            <div>
              <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Program</p>
              <p className="theme-heading font-bold">{student.program.major}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Level</p>
                <p className="theme-heading font-bold">{student.program.degreeLevel || '---'}</p>
              </div>
              <div>
                <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Campus</p>
                <p className="theme-heading font-bold">{student.university.campus || '---'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="theme-card space-y-6 rounded-[2rem] border p-8">
        <SectionHeader title="Contact & Banking" accent="amber" />
        <div className="grid gap-6 text-sm md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Phone</p>
            <p className="theme-heading font-bold">{student.contact.phone || '---'}</p>
          </div>
          <div>
            <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Emergency Contact</p>
            <p className="theme-heading font-bold">{student.contact.emergencyContactName || '---'}</p>
          </div>
          <div>
            <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">Bank</p>
            <p className="theme-heading font-bold">{student.bank.bankName || '---'}</p>
          </div>
          <div>
            <p className="theme-text-muted mb-2 text-[10px] font-black uppercase tracking-[0.2em]">RIB / IBAN</p>
            <p className="theme-heading break-all font-mono font-bold">{student.bankAccount.iban || '---'}</p>
          </div>
        </div>
      </div>

      <div className="theme-card space-y-6 rounded-[2rem] border p-8">
        <SectionHeader title="Academic Progress" accent="indigo" />
        {sortedAcademicHistory.length > 0 ? (
          <div className="space-y-6">
            <div className="theme-card-muted rounded-[1.75rem] border p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="theme-text-muted mb-1 text-[10px] font-black uppercase tracking-[0.2em]">
                    Yearly Moyenne
                  </p>
                  <p className="theme-heading text-3xl font-black tracking-tight">
                    {latestAcademicEntry ? `${latestAcademicEntry.grade}/20` : '---'}
                  </p>
                </div>
                <p className="theme-text-muted text-xs font-semibold">
                  Academic progress by year
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={academicChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attacheAcademicProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-primary-soft)" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="var(--theme-primary-soft)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(192, 184, 122, 0.45)" />
                    <XAxis
                      dataKey="label"
                      stroke="var(--theme-text-muted)"
                      fontSize={10}
                      fontWeight="bold"
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="var(--theme-text-muted)"
                      domain={[0, 20]}
                      fontSize={10}
                      fontWeight="bold"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '20px',
                        border: 'none',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        padding: '16px',
                        fontWeight: 'bold',
                      }}
                      formatter={(value) => [`${value}/20`, 'Moyenne']}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ''}
                    />
                    <Area
                      type="monotone"
                      dataKey="grade"
                      stroke="var(--theme-primary)"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#attacheAcademicProgress)"
                      dot={{
                        r: 4,
                        strokeWidth: 2,
                        stroke: 'var(--theme-primary)',
                        fill: 'var(--theme-surface, #fff)',
                      }}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        stroke: 'var(--theme-primary)',
                        fill: 'var(--theme-surface, #fff)',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              {sortedAcademicHistory.map((entry) => (
                <AcademicHistoryItem key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ) : (
          <p className="theme-text-muted text-sm">No academic submissions found for this student.</p>
        )}
      </div>
    </div>
  );
}
