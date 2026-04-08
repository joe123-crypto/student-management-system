import React from 'react';
import {
  Building2,
  GraduationCap,
  IdCard,
  Landmark,
  LineChart,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react';
import type { ProgressDetails, StudentProfile } from '@/types';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import AcademicHistoryItem from '@/components/ui/AcademicHistoryItem';
import { getSortedAcademicHistory } from '@/lib/students/academicHistory';

interface StudentDetailViewProps {
  student: StudentProfile;
  onBack: () => void;
  onDeleteProgressRecord?: (entry: ProgressDetails) => Promise<void>;
}

const surfaceCardClass =
  'theme-card relative overflow-hidden rounded-[2.25rem] border bg-[linear-gradient(180deg,rgba(252,248,234,0.98),rgba(247,241,221,0.9))] shadow-[0_22px_50px_rgba(37,79,34,0.08)]';
const fieldLabelClass = 'theme-text-muted type-label';
const fieldValueClass = 'theme-heading mt-2 text-base font-semibold leading-tight';
const fieldValueStrongClass = 'theme-heading type-card-title mt-2';

function DetailSectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,79,34,0.1)] text-[color:var(--theme-primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h5 className="theme-heading type-card-title">{title}</h5>
        <p className="theme-text-muted type-body-sm">{description}</p>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  emphasis = 'default',
  mono = false,
}: {
  label: string;
  value: string;
  emphasis?: 'default' | 'strong';
  mono?: boolean;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.4)] px-4 py-4">
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

export default function StudentDetailView({
  student,
  onBack,
  onDeleteProgressRecord,
}: StudentDetailViewProps) {
  const [isChartReady, setIsChartReady] = React.useState(false);
  const [deletingEntryId, setDeletingEntryId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState('');
  const sortedAcademicHistory = getSortedAcademicHistory(student.academicHistory);

  const academicChartData = sortedAcademicHistory.map((entry) => ({
    label: entry.year,
    fullLabel: `${entry.year} - ${entry.level}`,
    grade: Number(entry.grade),
  }));

  const latestAcademicEntry = sortedAcademicHistory[sortedAcademicHistory.length - 1];
  const programLine = [student.program.major, student.university.universityName].filter(Boolean).join(' at ');

  React.useEffect(() => {
    setIsChartReady(false);

    const frameId = window.requestAnimationFrame(() => {
      setIsChartReady(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [academicChartData.length]);

  const handleDeleteProgressRecord = async (entry: ProgressDetails) => {
    if (!onDeleteProgressRecord || deletingEntryId) {
      return;
    }

    setDeletingEntryId(entry.id);
    setActionError('');

    try {
      await onDeleteProgressRecord(entry);
    } catch (error) {
      console.error('[STUDENTS] Failed to delete progress record:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'We could not delete this progress record. Please try again.',
      );
    } finally {
      setDeletingEntryId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="theme-text-muted hover:bg-[rgba(237,228,194,0.24)]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Student Records
        </Button>
        <StatusBadge status={student.status} />
      </div>

      <div className={`${surfaceCardClass} p-6 md:p-7`}>
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgba(37,79,34,0.08)] blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:text-left">
            <div className="theme-card-muted flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border shadow-[0_18px_35px_rgba(37,79,34,0.08)]">
              {student.student.profilePicture ? (
                <img
                  src={student.student.profilePicture}
                  alt={`${student.student.fullName} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="theme-text-muted text-3xl font-bold">
                  {student.student.fullName.charAt(0)}
                </span>
              )}
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="space-y-2">
                <p className="theme-text-muted type-label">Student profile</p>
                <h4 className="theme-heading type-page-title">
                  {student.student.fullName}
                </h4>
                <p className="theme-text-muted type-body max-w-2xl">
                  {programLine || 'Program and university details will appear here once available.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4">
                  <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                    <IdCard className="h-4 w-4" />
                    <p className={fieldLabelClass}>Inscription number</p>
                  </div>
                  <p className="mt-2 font-mono text-base font-semibold text-[color:var(--theme-primary)]">
                    {student.student.inscriptionNumber || '---'}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4">
                  <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                    <Mail className="h-4 w-4" />
                    <p className={fieldLabelClass}>Email address</p>
                  </div>
                  <p className="mt-2 text-base font-semibold leading-tight text-[color:var(--theme-text)]">
                    {student.contact.email || '---'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[17rem] xl:grid-cols-1">
            <div className="rounded-[1.4rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4">
              <p className={fieldLabelClass}>Status</p>
              <div className="mt-3">
                <StatusBadge status={student.status} className="px-3 py-1.5 text-[11px] font-semibold" />
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4">
              <p className={fieldLabelClass}>Level</p>
              <p className={fieldValueClass}>{student.program.degreeLevel || '---'}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4">
              <p className={fieldLabelClass}>Campus</p>
              <p className={fieldValueClass}>{student.university.campus || '---'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className={`${surfaceCardClass} p-6 md:p-7`}>
          <DetailSectionHeader
            icon={UserRound}
            title="Personal identity"
            description="The key identity details that should be easy to scan."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailField label="Given name" value={student.student.givenName || '---'} />
            <DetailField label="Family name" value={student.student.familyName || '---'} />
            <DetailField label="Date of birth" value={student.student.dateOfBirth || '---'} />
            <DetailField label="Nationality" value={student.student.nationality || '---'} emphasis="strong" />
          </div>
        </div>

        <div className={`${surfaceCardClass} p-6 md:p-7`}>
          <DetailSectionHeader
            icon={GraduationCap}
            title="University and program"
            description="Primary academic details, with the most important information carrying more weight."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <DetailField label="University" value={student.university.universityName || '---'} emphasis="strong" />
            </div>
            <div className="sm:col-span-2">
              <DetailField label="Program" value={student.program.major || '---'} emphasis="strong" />
            </div>
            <DetailField label="Level" value={student.program.degreeLevel || '---'} />
            <DetailField label="Campus" value={student.university.campus || '---'} />
          </div>
        </div>
      </div>

      <div className={`${surfaceCardClass} p-6 md:p-7`}>
        <DetailSectionHeader
          icon={Building2}
          title="Contact and banking"
          description="Grouped so supporting details feel connected instead of scattered."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[rgba(220,205,166,0.48)] bg-[rgba(255,255,255,0.38)] p-5">
            <DetailSectionHeader
              icon={Phone}
              title="Contact details"
              description="Practical contact points for the student."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Phone" value={student.contact.phone || '---'} />
              <DetailField label="Emergency contact" value={student.contact.emergencyContactName || '---'} />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[rgba(220,205,166,0.48)] bg-[rgba(255,255,255,0.38)] p-5">
            <DetailSectionHeader
              icon={Landmark}
              title="Banking details"
              description="Important payout and account identifiers."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Bank" value={student.bank.bankName || '---'} />
              <DetailField label="RIB / IBAN" value={student.bankAccount.iban || '---'} mono />
            </div>
          </div>
        </div>
      </div>

      <div className={`${surfaceCardClass} p-6 md:p-7`}>
        <DetailSectionHeader
          icon={LineChart}
          title="Academic progress"
          description="Performance history with the current standing called out first."
        />
        {actionError ? (
          <div className="theme-danger mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold">
            {actionError}
          </div>
        ) : null}
        {sortedAcademicHistory.length > 0 ? (
          <div className="space-y-6">
            <div className="theme-card-muted rounded-[1.75rem] border p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={fieldLabelClass}>Latest yearly moyenne</p>
                  <p className="theme-heading type-metric">
                    {latestAcademicEntry ? `${latestAcademicEntry.grade}/20` : '---'}
                  </p>
                </div>
                <p className="theme-text-muted text-xs font-semibold">Academic progress by year</p>
              </div>

              <div className="h-64 w-full">
                {isChartReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                    <AreaChart data={academicChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attacheAcademicProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0} />
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
                          fill: 'var(--theme-surface)',
                        }}
                        activeDot={{
                          r: 6,
                          strokeWidth: 2,
                          stroke: 'var(--theme-primary)',
                          fill: 'var(--theme-surface)',
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="theme-card-muted h-full rounded-[1.5rem] border border-[rgba(220,205,166,0.42)]" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              {sortedAcademicHistory.map((entry) => (
                <AcademicHistoryItem
                  key={entry.id}
                  entry={entry}
                  onDelete={onDeleteProgressRecord ? handleDeleteProgressRecord : undefined}
                  isDeleting={deletingEntryId === entry.id}
                />
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
