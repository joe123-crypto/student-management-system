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
import { useNotifications } from '@/components/providers/NotificationProvider';
import { readFileAsDataUrl, uploadManagedFile } from '@/lib/files/client';
import { getErrorMessage } from '@/lib/errors';
import { mergeStudentProfile } from '@/lib/students/profile';
import { isMockDbEnabled } from '@/test/mock/config';
import {
  getFromStorage,
  removeFromStorage,
  setInStorage,
} from '@/components/shell/shared/storage';

interface StudentDashboardProps {
  student: StudentProfile | null;
  announcements: Announcement[];
  isStudentLoading: boolean;
  isAnnouncementsLoading: boolean;
  onUpdate: (id: string, profile: Partial<StudentProfile>) => Promise<void>;
  section: 'dashboard' | 'settings';
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onChangePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; message: string }>;
  onLogout: () => void;
}

const tabItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'profile', label: 'My Profile', shortLabel: 'Profile' },
  { id: 'academic', label: 'Academic Progress', shortLabel: 'Academics' },
] as const;

type ActiveTab = (typeof tabItems)[number]['id'];

interface PersistedStudentDashboardState {
  activeTab: ActiveTab;
  isEditing: boolean;
  isUpdatingAcademic: boolean;
  editData: StudentProfile | null;
  newProgress: Partial<ProgressDetails>;
  isActionCenterExpanded: boolean;
}

const studentDashboardStateVersion = 'v1';

function getStudentDashboardStateKey(studentId: string) {
  return `student-dashboard-state:${studentDashboardStateVersion}:${studentId}`;
}

function cloneStudentProfile(profile: StudentProfile | null): StudentProfile | null {
  return profile ? (JSON.parse(JSON.stringify(profile)) as StudentProfile) : null;
}

const inputClass =
  'theme-input w-full rounded-2xl border px-5 py-3.5 outline-none transition-all';

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  announcements,
  isStudentLoading,
  isAnnouncementsLoading,
  onUpdate,
  section,
  onNavigateSection,
  onChangePassword,
  onLogout,
}) => {
  const notifications = useNotifications();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [optimisticStudent, setOptimisticStudent] = useState<StudentProfile | null>(student);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingAcademic, setIsUpdatingAcademic] = useState(false);
  const [editData, setEditData] = useState<StudentProfile | null>(() => cloneStudentProfile(student));
  const [isProfileDataLoading, setIsProfileDataLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
  const [isUploadingProofDocument, setIsUploadingProofDocument] = useState(false);
  const [isSubmittingAcademic, setIsSubmittingAcademic] = useState(false);
  const [isActionCenterExpanded, setIsActionCenterExpanded] = useState(false);
  const [hasHydratedPersistedState, setHasHydratedPersistedState] = useState(false);
  const [newProgress, setNewProgress] = useState<Partial<ProgressDetails>>({
    year: '',
    level: '',
    grade: '',
    proofDocument: '',
  });

  const visibleStudent = optimisticStudent ?? student;

  useEffect(() => {
    setOptimisticStudent(student);
  }, [student]);

  useEffect(() => {
    setHasHydratedPersistedState(false);
    const storageKey = student?.id ? getStudentDashboardStateKey(student.id) : null;

    if (!storageKey) {
      setHasHydratedPersistedState(true);
      return;
    }

    const persistedState = getFromStorage<PersistedStudentDashboardState | null>(storageKey, null);

    if (persistedState) {
      setActiveTab(persistedState.activeTab);
      setIsEditing(persistedState.isEditing);
      setIsUpdatingAcademic(persistedState.isUpdatingAcademic);
      setEditData(persistedState.editData);
      setNewProgress(persistedState.newProgress);
      setIsActionCenterExpanded(persistedState.isActionCenterExpanded);
    } else {
      setActiveTab('overview');
      setIsEditing(false);
      setIsUpdatingAcademic(false);
      setEditData(cloneStudentProfile(student ?? null));
      setNewProgress({
        year: '',
        level: '',
        grade: '',
        proofDocument: '',
      });
      setIsActionCenterExpanded(false);
    }

    setIsProfileDataLoading(false);
    setHasHydratedPersistedState(true);
  }, [student]);

  useEffect(() => {
    if (!visibleStudent) {
      setEditData(null);
      setIsProfileDataLoading(false);
      return;
    }

    if (isEditing) {
      setIsProfileDataLoading(false);
      return;
    }

    setEditData(cloneStudentProfile(visibleStudent));
    setIsProfileDataLoading(false);
  }, [visibleStudent, isEditing]);

  useEffect(() => {
    if (!hasHydratedPersistedState || !student?.id) {
      return;
    }

    const storageKey = getStudentDashboardStateKey(student.id);

    if (
      activeTab === 'overview' &&
      !isEditing &&
      !isUpdatingAcademic &&
      !isActionCenterExpanded &&
      !newProgress.year &&
      !newProgress.level &&
      !newProgress.grade &&
      !newProgress.proofDocument
    ) {
      removeFromStorage(storageKey);
      return;
    }

    setInStorage<PersistedStudentDashboardState>(storageKey, {
      activeTab,
      isEditing,
      isUpdatingAcademic,
      editData: isEditing ? editData : null,
      newProgress,
      isActionCenterExpanded,
    });
  }, [
    activeTab,
    editData,
    hasHydratedPersistedState,
    isActionCenterExpanded,
    isEditing,
    isUpdatingAcademic,
    newProgress,
    student?.id,
  ]);

  if (!visibleStudent && !isStudentLoading) {
    return <LoadingSpinner fullScreen label="Loading your profile..." />;
  }

  const isStudentDataPending = isStudentLoading || !visibleStudent;

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

  const commitStudentUpdate = async (patch: Partial<StudentProfile>) => {
    if (!visibleStudent) {
      return;
    }

    const previousStudent = visibleStudent;
    setOptimisticStudent(mergeStudentProfile(previousStudent, patch));

    try {
      await onUpdate(previousStudent.id, patch);
    } catch (error) {
      setOptimisticStudent(student ?? previousStudent);
      throw error;
    }
  };

  const saveProfile = async () => {
    if (!editData || !visibleStudent || isSavingProfile) return;

    setIsSavingProfile(true);
    try {
      const profilePatch = {
        student: { ...visibleStudent.student, profilePicture: editData.student.profilePicture },
        bank: editData.bank,
        bankAccount: editData.bankAccount,
      };

      await commitStudentUpdate(profilePatch);
      setIsEditing(false);
      setEditData(cloneStudentProfile(mergeStudentProfile(visibleStudent, profilePatch)));
      notifications.notify({
        tone: 'success',
        title: 'Bank details saved',
        message: 'Your updated banking information is now reflected in your profile.',
      });
    } catch (error) {
      console.error('[STUDENTS] Failed to save profile:', error);
      notifications.notify({
        tone: 'error',
        title: 'Could not save your profile',
        message: getErrorMessage(error, 'Failed to save your profile.'),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const submitAcademicUpdate = async () => {
    if (!visibleStudent || isSubmittingAcademic) {
      return;
    }

    if (!newProgress.year || !newProgress.grade || !newProgress.level) {
      notifications.notify({
        tone: 'warning',
        title: 'Missing academic details',
        message: 'Please fill in the year, level, and final grade before submitting.',
      });
      return;
    }

    setIsSubmittingAcademic(true);
    const updatedHistory = [...(visibleStudent.academicHistory || [])];
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
    try {
      await commitStudentUpdate({ academicHistory: updatedHistory });
      setIsUpdatingAcademic(false);
      setNewProgress({ year: '', level: '', grade: '', proofDocument: '' });
      notifications.showDialog({
        tone: 'success',
        title: 'Academic update submitted',
        message:
          'Your latest result has been sent for validation, and you have been returned to the academic progress screen.',
        confirmLabel: 'Return to progress',
        closeOnOverlayClick: false,
      });
    } catch (error) {
      console.error('[STUDENTS] Failed to submit academic update:', error);
      notifications.notify({
        tone: 'error',
        title: 'Could not submit your academic update',
        message: getErrorMessage(error, 'Failed to submit your academic update.'),
      });
    } finally {
      setIsSubmittingAcademic(false);
    }
  };

  const getMissingItems = () => {
    if (!visibleStudent) {
      return [];
    }

    const items: string[] = [];
    if (!visibleStudent.student.profilePicture) items.push('Profile picture is missing');
    if (!visibleStudent.bankAccount.iban) items.push('Bank RIB Key is missing');
    if (!visibleStudent.bank.branchCode) items.push('Bank Branch Code is missing');

    const hasYear1 = visibleStudent.academicHistory?.some((h) => h.year === 'Year 1');
    if (!hasYear1) items.push('Progress report for Year 1 is pending');

    return items;
  };

  const missingItems = getMissingItems();
  const currentPicture =
    isEditing && editData ? editData.student.profilePicture : visibleStudent?.student.profilePicture;
  const dashboardLayoutClassName = isActionCenterExpanded
    ? 'relative grid gap-8 pb-24 md:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]'
    : 'relative grid gap-8 pb-24 md:grid-cols-[minmax(0,1fr)_5.75rem]';

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const resetEditDataToVisibleStudent = () => {
    if (!visibleStudent) {
      setEditData(null);
      return;
    }

    setEditData(cloneStudentProfile(visibleStudent));
  };

  const uploadProfilePicture = async (file: File) => {
    if (!visibleStudent || isUploadingProfilePicture) {
      return;
    }

    setIsUploadingProfilePicture(true);
    try {
      const nextValue = isMockDbEnabled()
        ? await readFileAsDataUrl(file)
        : (await uploadManagedFile({
            purpose: 'PROFILE_IMAGE',
            studentProfileId: visibleStudent.id,
            file,
          })).contentUrl;

      handleUpdateField('student', 'profilePicture', nextValue);
      await commitStudentUpdate({
        student: { ...visibleStudent.student, profilePicture: nextValue },
      });
      notifications.notify({
        tone: 'success',
        title: 'Profile picture updated',
        message: 'Your new profile picture has been saved.',
        durationMs: 3200,
      });
    } catch (error) {
      console.error('[FILES] Failed to upload profile picture:', error);
      notifications.notify({
        tone: 'error',
        title: 'Could not upload your profile picture',
        message: getErrorMessage(error, 'Failed to upload profile picture.'),
      });
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!visibleStudent || isUploadingProfilePicture) {
      return;
    }

    setIsUploadingProfilePicture(true);
    try {
      handleUpdateField('student', 'profilePicture', '');
      await commitStudentUpdate({
        student: { ...visibleStudent.student, profilePicture: '' },
      });
      notifications.notify({
        tone: 'success',
        title: 'Profile picture removed',
        message: 'Your profile picture has been cleared.',
        durationMs: 3200,
      });
    } catch (error) {
      console.error('[FILES] Failed to remove profile picture:', error);
      notifications.notify({
        tone: 'error',
        title: 'Could not remove your profile picture',
        message: getErrorMessage(error, 'Failed to remove profile picture.'),
      });
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  const uploadProofDocument = async (file: File) => {
    if (!visibleStudent || isUploadingProofDocument) {
      return;
    }

    setIsUploadingProofDocument(true);
    try {
      const nextValue = isMockDbEnabled()
        ? await readFileAsDataUrl(file)
        : (await uploadManagedFile({
            purpose: 'RESULT_SLIP',
            studentProfileId: visibleStudent.id,
            file,
          })).contentUrl;

      setNewProgress((current) => ({ ...current, proofDocument: nextValue }));
      notifications.notify({
        tone: 'success',
        title: 'Transcript uploaded',
        message: 'Your document is attached and ready for submission.',
        durationMs: 3200,
      });
    } catch (error) {
      console.error('[FILES] Failed to upload proof document:', error);
      notifications.notify({
        tone: 'error',
        title: 'Could not upload your proof document',
        message: getErrorMessage(error, 'Failed to upload proof document.'),
      });
    } finally {
      setIsUploadingProofDocument(false);
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
      profilePicture={visibleStudent?.student.profilePicture}
      showSettingsMenu
    >
      {section === 'dashboard' ? (
        <>
          <Tabs
            items={tabItems}
            activeTab={activeTab}
            onChange={handleTabChange}
            className="mb-10"
            mobileLayout="grid"
          />

          <div className="mb-10 md:hidden">
            <StudentMissingInfoSidebar
              items={missingItems}
              loading={isStudentDataPending}
              isExpanded={isActionCenterExpanded}
              onToggleExpanded={() => setIsActionCenterExpanded((prev) => !prev)}
            />
          </div>

          <div className={dashboardLayoutClassName}>
            <div className="min-w-0 space-y-10">
              {activeTab === 'overview' ? (
                <StudentDashboardOverview
                  student={visibleStudent}
                  announcements={announcements}
                  isStudentLoading={isStudentDataPending}
                  isAnnouncementsLoading={isAnnouncementsLoading}
                />
              ) : null}

              {activeTab === 'profile' ? (
                <>
                  <StudentProfilePanel
                    student={visibleStudent}
                    currentPicture={currentPicture}
                    loading={isStudentDataPending || isProfileDataLoading || !editData}
                    onProfilePictureChange={uploadProfilePicture}
                    onProfilePictureRemove={removeProfilePicture}
                    isUploadingProfilePicture={isUploadingProfilePicture}
                  />

                  {!isStudentDataPending && !isProfileDataLoading && editData && visibleStudent ? (
                    <StudentContactBankPanel
                      student={visibleStudent}
                      editData={editData}
                      isEditing={isEditing}
                      isSaving={isSavingProfile}
                      inputClassName={inputClass}
                      onToggleEdit={() => setIsEditing((prev) => !prev)}
                      onDiscard={() => {
                        setIsEditing(false);
                        resetEditDataToVisibleStudent();
                      }}
                      onSave={saveProfile}
                      onUpdateField={handleUpdateField}
                    />
                  ) : (
                    <StudentContactBankPanel loading />
                  )}
                </>
              ) : null}

              {activeTab === 'academic' ? (
                isStudentDataPending ? (
                  <StudentAcademicProgressPanel loading onStartUpdate={() => undefined} />
                ) : isUpdatingAcademic ? (
                  <StudentAcademicUpdateForm
                    newProgress={newProgress}
                    inputClassName={inputClass}
                    onFieldChange={(field, value) => setNewProgress((p) => ({ ...p, [field]: value }))}
                    onProofDocumentUpload={uploadProofDocument}
                    onBack={() => setIsUpdatingAcademic(false)}
                    onSubmit={() => {
                      void submitAcademicUpdate();
                    }}
                    isUploadingProofDocument={isUploadingProofDocument}
                    isSubmitting={isSubmittingAcademic}
                  />
                ) : (
                  <StudentAcademicProgressPanel
                    academicHistory={visibleStudent.academicHistory}
                    status={visibleStudent.status}
                    onStartUpdate={() => setIsUpdatingAcademic(true)}
                  />
                )
              ) : null}
            </div>
            <div className="hidden md:block">
              <StudentMissingInfoSidebar
                items={missingItems}
                loading={isStudentDataPending}
                isExpanded={isActionCenterExpanded}
                onToggleExpanded={() => setIsActionCenterExpanded((prev) => !prev)}
              />
            </div>
          </div>
        </>
      ) : (
        <StudentPasswordSettings onChangePassword={onChangePassword} inputClassName={inputClass} />
      )}
    </Layout>
  );
};

export default StudentDashboard;
