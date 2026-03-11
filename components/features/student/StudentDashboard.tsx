import React, { useEffect, useState } from 'react';
import { Announcement, ProgressDetails, StudentProfile, UserRole } from '@/types';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/ui/Tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StudentDashboardOverview from '@/components/features/student/dashboard/StudentDashboardOverview';
import StudentProfilePanel from '@/components/features/student/dashboard/StudentProfilePanel';
import StudentContactBankPanel from '@/components/features/student/dashboard/StudentContactBankPanel';
import StudentAcademicProgressPanel from '@/components/features/student/dashboard/StudentAcademicProgressPanel';
import StudentAcademicUpdateForm from '@/components/features/student/dashboard/StudentAcademicUpdateForm';
import StudentMissingInfoSidebar from '@/components/features/student/dashboard/StudentMissingInfoSidebar';
import StudentPasswordSettings from '@/components/features/student/dashboard/StudentPasswordSettings';

interface StudentDashboardProps {
  student: StudentProfile | null;
  announcements: Announcement[];
  onUpdate: (id: string, profile: Partial<StudentProfile>) => void;
  section: 'dashboard' | 'settings';
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onChangePassword: (currentPassword: string, newPassword: string) => { ok: boolean; message: string };
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

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  announcements,
  onUpdate,
  section,
  onNavigateSection,
  onChangePassword,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingAcademic, setIsUpdatingAcademic] = useState(false);
  const [editData, setEditData] = useState<StudentProfile | null>(null);
  const [isProfileDataLoading, setIsProfileDataLoading] = useState(true);
  const [newProgress, setNewProgress] = useState<Partial<ProgressDetails>>({
    year: '',
    level: '',
    grade: '',
    proofDocument: '',
  });

  useEffect(() => {
    if (!student) {
      setEditData(null);
      setIsProfileDataLoading(false);
      return;
    }

    setIsProfileDataLoading(true);
    const timerId = window.setTimeout(() => {
      setEditData(JSON.parse(JSON.stringify(student)));
      setIsProfileDataLoading(false);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [student]);

  if (!student) {
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
    if (!editData) return;
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
  const currentPicture = isEditing && editData ? editData.student.profilePicture : student.student.profilePicture;

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

          <div className="relative grid gap-8 pb-24 md:grid-cols-3">
            <div className="space-y-10 md:col-span-2">
              {activeTab === 'overview' ? <StudentDashboardOverview announcements={announcements} /> : null}

              {activeTab === 'profile' ? (
                <>
                  <StudentProfilePanel
                    student={student}
                    currentPicture={currentPicture}
                    loading={isProfileDataLoading || !editData}
                    onProfilePictureChange={(base64) => {
                      handleUpdateField('student', 'profilePicture', base64);
                      if (!isEditing) {
                        onUpdate(student.id, {
                          student: { ...student.student, profilePicture: base64 },
                        });
                      }
                    }}
                    onProfilePictureRemove={() => {
                      handleUpdateField('student', 'profilePicture', '');
                      if (!isEditing) {
                        onUpdate(student.id, {
                          student: { ...student.student, profilePicture: '' },
                        });
                      }
                    }}
                  />

                  {!isProfileDataLoading && editData ? (
                    <StudentContactBankPanel
                      student={student}
                      editData={editData}
                      isEditing={isEditing}
                      inputClassName={inputClass}
                      onToggleEdit={() => setIsEditing((prev) => !prev)}
                      onDiscard={() => setIsEditing(false)}
                      onSave={saveProfile}
                      onUpdateField={handleUpdateField}
                    />
                  ) : null}
                </>
              ) : null}

              {activeTab === 'academic' ? (
                isUpdatingAcademic ? (
                  <StudentAcademicUpdateForm
                    newProgress={newProgress}
                    inputClassName={inputClass}
                    onFieldChange={(field, value) => setNewProgress((p) => ({ ...p, [field]: value }))}
                    onBack={() => setIsUpdatingAcademic(false)}
                    onSubmit={submitAcademicUpdate}
                  />
                ) : (
                  <StudentAcademicProgressPanel
                    academicHistory={student.academicHistory}
                    onStartUpdate={() => setIsUpdatingAcademic(true)}
                  />
                )
              ) : null}
            </div>

            <StudentMissingInfoSidebar items={missingItems} />
          </div>
        </>
      ) : (
        <StudentPasswordSettings onChangePassword={onChangePassword} inputClassName={inputClass} />
      )}
    </Layout>
  );
};

export default StudentDashboard;
