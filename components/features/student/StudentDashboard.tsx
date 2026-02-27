import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Announcement, ProgressDetails, StudentProfile, UserRole } from '@/types';
import { PROGRESS_DATA } from '@/constants';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/ui/Tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatCard from '@/components/ui/StatCard';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import FileUploadDropzone from '@/components/ui/FileUploadDropzone';
import AcademicHistoryItem from '@/components/ui/AcademicHistoryItem';
import ActionCard from '@/components/ui/ActionCard';
import { AnnouncementFeedSection } from '@/components/features/shared/announcements/AnnouncementSections';
import { FolderOpen } from 'lucide-react';

interface StudentDashboardProps {
  student: StudentProfile | null;
  announcements: Announcement[];
  onUpdate: (id: string, profile: Partial<StudentProfile>) => void;
  section: 'dashboard' | 'settings';
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

const tabItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'profile', label: 'My Profile' },
  { id: 'academic', label: 'Academic Progress' },
] as const;

type ActiveTab = (typeof tabItems)[number]['id'];

const inputClass =
  'w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all';
const tinyLabelClass = 'text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block';
const infoValueClass = 'text-lg font-semibold text-slate-900';

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  announcements,
  onUpdate,
  section,
  onNavigateSection,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingAcademic, setIsUpdatingAcademic] = useState(false);
  const [editData, setEditData] = useState<StudentProfile | null>(null);
  const [newProgress, setNewProgress] = useState<Partial<ProgressDetails>>({
    year: '',
    level: '',
    grade: '',
    proofDocument: '',
  });

  useEffect(() => {
    if (student) setEditData(JSON.parse(JSON.stringify(student)));
  }, [student, isEditing]);

  if (!student || !editData) {
    return <LoadingSpinner fullScreen label="Loading your profile..." />;
  }

  const handleUpdateField = (section: keyof StudentProfile, field: string, value: unknown) => {
    setEditData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...((prev[section] as Record<string, unknown> | undefined) ?? {}),
          [field]: value,
        },
      };
    });
  };

  const saveProfile = () => {
    onUpdate(student.id, {
      student: { ...student.student, profilePicture: editData.student.profilePicture },
      bank: editData.bank,
      bankAccount: editData.bankAccount,
    });
    setIsEditing(false);
  };

  const submitAcademicUpdate = () => {
    if (!newProgress.year || !newProgress.grade || !newProgress.level) {
      alert('Please fill in Year, Level, and Grade.');
      return;
    }

    const updatedHistory = [...(student.academicHistory || [])];
    const newEntry: ProgressDetails = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      year: newProgress.year!,
      level: newProgress.level!,
      grade: newProgress.grade!,
      status: 'PENDING',
      proofDocument: newProgress.proofDocument,
    };

    updatedHistory.push(newEntry);
    onUpdate(student.id, { academicHistory: updatedHistory });
    setIsUpdatingAcademic(false);
    setNewProgress({ year: '', level: '', grade: '', proofDocument: '' });
  };

  const getMissingItems = () => {
    const items: string[] = [];
    if (!student.student.profilePicture) items.push('Profile picture is missing');
    if (!student.bankAccount.iban) items.push('Bank RIB Key is missing');
    if (!student.bank.branchCode) items.push('Bank Branch Code is missing');

    const hasYear1 = student.academicHistory?.some((h) => h.year === 'Year 1');
    if (!hasYear1) items.push('Progress report for Year 1 is pending');

    return items;
  };

  const missingItems = getMissingItems();
  const currentPicture = isEditing ? editData.student.profilePicture : student.student.profilePicture;

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      setIsEditing(false);
      setIsUpdatingAcademic(false);
    }
    if (tab === 'profile') {
      setIsUpdatingAcademic(false);
    }
    if (tab === 'academic') {
      setIsEditing(false);
    }
  };

  return (
    <Layout
      role={UserRole.STUDENT}
      title={section === 'dashboard' ? 'Student Dashboard' : 'Settings'}
      onLogout={onLogout}
      activeTab={section === 'dashboard' ? 'home' : 'settings'}
      setActiveTab={(tab: string) =>
        onNavigateSection(tab === 'settings' ? 'settings' : 'dashboard')
      }
      profilePicture={student.student.profilePicture}
      showSettingsMenu
    >
      {section === 'dashboard' ? (
        <>
      <Tabs items={tabItems} activeTab={activeTab} onChange={handleTabChange} className="mb-10" />

      <div className="grid md:grid-cols-3 gap-8 relative pb-24">
        <div className="md:col-span-2 space-y-10">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard label="Niveau" value="L1" suffix="/ L2" />
                <StatCard label="Grade" value="17.2" suffix="/ 20" valueClassName="text-indigo-600" />
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                <AnnouncementFeedSection
                  announcements={announcements}
                  title="Latest Announcements"
                  titleVariant="headline"
                  listClassName="space-y-6"
                />
              </div>
            </>
          )}

          {activeTab === 'profile' && (
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
                    onChange={(base64) => {
                      handleUpdateField('student', 'profilePicture', base64);
                      if (!isEditing) {
                        onUpdate(student.id, {
                          student: { ...student.student, profilePicture: base64 },
                        });
                      }
                    }}
                    onRemove={() => {
                      handleUpdateField('student', 'profilePicture', undefined);
                      if (!isEditing) {
                        onUpdate(student.id, {
                          student: { ...student.student, profilePicture: undefined },
                        });
                      }
                    }}
                  />
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold tracking-tight text-[#101942]">{student.student.fullName}</h4>
                    <p className="text-xl font-medium text-slate-600">
                      Inscription Number:{' '}
                      <span className="font-mono text-lg font-semibold text-indigo-600">{student.student.inscriptionNumber}</span>
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
                    <h5 className="text-base font-black uppercase tracking-[0.16em] text-slate-500">University & Program</h5>
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

              <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-2 rounded-full bg-amber-500" />
                    <h5 className="text-base font-black uppercase tracking-[0.16em] text-slate-500">Contact & Banking</h5>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? 'secondary' : 'primary'}
                    className={isEditing ? 'bg-slate-200 text-slate-700' : 'rounded-full'}
                  >
                    {isEditing ? 'Cancel' : 'Edit Bank Details'}
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className={tinyLabelClass}>Phone</p>
                    <p className="text-xl font-black text-slate-900">{student.contact.phone || '---'}</p>
                  </div>
                  <div>
                    <p className={tinyLabelClass}>Emergency Contact</p>
                    <p className="text-xl font-black text-slate-900">{student.contact.emergencyContactName || '---'}</p>
                  </div>
                  <div>
                    <p className={tinyLabelClass}>Bank</p>
                    {isEditing ? (
                      <input
                        value={editData.bank.bankName}
                        onChange={(e) => handleUpdateField('bank', 'bankName', e.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <p className="text-xl font-black text-slate-900">{student.bank.bankName || '---'}</p>
                    )}
                  </div>
                  <div>
                    <p className={tinyLabelClass}>RIB / IBAN</p>
                    {isEditing ? (
                      <input
                        value={editData.bankAccount.iban}
                        onChange={(e) => handleUpdateField('bankAccount', 'iban', e.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <p className="text-xl font-black text-indigo-600">{student.bankAccount.iban || '---'}</p>
                    )}
                  </div>
                  <div>
                    <p className={tinyLabelClass}>Account Number</p>
                    {isEditing ? (
                      <input
                        value={editData.bankAccount.accountNumber}
                        onChange={(e) => handleUpdateField('bankAccount', 'accountNumber', e.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <p className="text-xl font-black text-slate-900">{student.bankAccount.accountNumber || '---'}</p>
                    )}
                  </div>
                  <div>
                    <p className={tinyLabelClass}>Branch Code</p>
                    {isEditing ? (
                      <input
                        value={editData.bank.branchCode || ''}
                        onChange={(e) => handleUpdateField('bank', 'branchCode', e.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <p className="text-xl font-black text-slate-900">{student.bank.branchCode || '---'}</p>
                    )}
                  </div>
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-500">
                  Personal and academic details are managed by administration.
                </p>

                {isEditing && (
                  <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Discard
                    </Button>
                    <Button onClick={saveProfile} className="rounded-full px-10">
                      Save Bank Details
                    </Button>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'academic' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 min-h-[500px] transition-all overflow-hidden relative">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <h4 className="text-2xl font-black text-[#1a1b3a] font-rounded">
                    {isUpdatingAcademic ? 'Upload Progress Details' : 'Progress'}
                  </h4>
                  {!isUpdatingAcademic && (
                    <Button size="sm" className="text-[10px] uppercase tracking-widest" onClick={() => setIsUpdatingAcademic(true)}>
                      Update
                    </Button>
                  )}
                </div>
                {!isUpdatingAcademic && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                    Real-time Data
                  </div>
                )}
              </div>

              {!isUpdatingAcademic ? (
                <div className="space-y-12">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PROGRESS_DATA}>
                        <defs>
                          <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#94a3b8" domain={[0, 4]} fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '20px',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            padding: '16px',
                            fontWeight: 'bold',
                          }}
                        />
                        <Area type="monotone" dataKey="gpa" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorGpa)" animationDuration={2000} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {student.academicHistory && student.academicHistory.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Submission History</h5>
                      <div className="grid gap-4">
                        {student.academicHistory.map((entry) => (
                          <AcademicHistoryItem key={entry.id} entry={entry} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in space-y-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <FormField label="Academic Year" labelClassName="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      <select
                        value={newProgress.year}
                        onChange={(e) => setNewProgress((p) => ({ ...p, year: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="">Select Year</option>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                        <option value="Year 5">Year 5</option>
                      </select>
                    </FormField>
                    <FormField label="Level" labelClassName="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      <input
                        placeholder="e.g. L1, M2"
                        value={newProgress.level}
                        onChange={(e) => setNewProgress((p) => ({ ...p, level: e.target.value }))}
                        className={inputClass}
                      />
                    </FormField>
                    <FormField label="Final Grade (/20)" labelClassName="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={newProgress.grade}
                        onChange={(e) => setNewProgress((p) => ({ ...p, grade: e.target.value }))}
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  <FormField label="Proof of Result (Transcript)" labelClassName="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                    <FileUploadDropzone
                      value={newProgress.proofDocument}
                      onChange={(base64) => setNewProgress((p) => ({ ...p, proofDocument: base64 }))}
                      onClear={() => setNewProgress((p) => ({ ...p, proofDocument: '' }))}
                      emptyTitle="Drop your transcript here"
                      emptySubtitle="Or click to browse (PDF, PNG, JPG)"
                    />
                  </FormField>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <Button variant="secondary" onClick={() => setIsUpdatingAcademic(false)} className="border-2 border-slate-200 text-slate-600">
                      Back
                    </Button>
                    <Button onClick={submitAcademicUpdate} className="px-12 py-4 rounded-2xl">
                      Submit for Validation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="relative self-start">
          <div className="md:sticky rounded-[2rem] top-6 max-h-[calc(100vh-3rem)] overflow-y-auto space-y-8 z-10 transition-all">
            <ActionCard
              title="Missing Information"
              items={missingItems}
              emptyMessage="Your profile is up to date!"
              priorityLabel="Priority High"
            />
          </div>
        </aside>
      </div>
        </>
      ) : (
        <div className="min-h-[420px] rounded-3xl border border-dashed border-slate-300 bg-white/80 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
              <FolderOpen className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Settings Home</h3>
            <p className="text-sm text-slate-500">This page is intentionally blank for now.</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentDashboard;
