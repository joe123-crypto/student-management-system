import { getServerSession } from 'next-auth';
import authConfig from '@/auth.config';
import { listAnnouncements } from '@/lib/announcements/store';
import { listPermissionRequests } from '@/lib/permission-requests/store';
import {
  ensureStudentProfileForIdentity,
  listStudentProfiles,
} from '@/lib/students/store';
import type { Announcement, PermissionRequest, StudentProfile, User } from '@/types';
import { UserRole } from '@/types';
import type { Session } from 'next-auth';

export type AppShellInitialData = {
  announcements: Announcement[];
  currentStudent: StudentProfile | null;
  permissionRequests: PermissionRequest[];
  students: StudentProfile[];
  user: User | null;
};

function toAppUser(session: Session | null): User | null {
  const sessionUser = session?.user;

  if (
    !sessionUser?.role ||
    !sessionUser.loginId ||
    !sessionUser.subject ||
    !sessionUser.authProvider
  ) {
    return null;
  }

  if (sessionUser.role !== UserRole.STUDENT && sessionUser.role !== UserRole.ATTACHE) {
    return null;
  }

  return {
    id: sessionUser.id || sessionUser.subject,
    role: sessionUser.role,
    loginId: sessionUser.loginId,
    subject: sessionUser.subject,
    authProvider: sessionUser.authProvider,
  };
}

export async function loadAppShellInitialData(): Promise<AppShellInitialData> {
  const session = await getServerSession(authConfig);
  const user = toAppUser(session);

  if (!user) {
    return {
      announcements: [],
      currentStudent: null,
      permissionRequests: [],
      students: [],
      user: null,
    };
  }

  if (user.role === UserRole.STUDENT) {
    const [announcements, currentStudent] = await Promise.all([
      listAnnouncements().catch((error) => {
        console.error('[APP_SHELL] Failed to load initial announcements:', error);
        return [];
      }),
      ensureStudentProfileForIdentity({
        id: user.id,
        loginId: user.loginId,
        role: user.role,
      }).catch((error) => {
        console.error('[APP_SHELL] Failed to load initial student profile:', error);
        return null;
      }),
    ]);

    return {
      announcements,
      currentStudent,
      permissionRequests: [],
      students: currentStudent ? [currentStudent] : [],
      user,
    };
  }

  const [announcements, permissionRequests, students] = await Promise.all([
    listAnnouncements().catch((error) => {
      console.error('[APP_SHELL] Failed to load initial announcements:', error);
      return [];
    }),
    listPermissionRequests().catch((error) => {
      console.error('[APP_SHELL] Failed to load initial permission requests:', error);
      return [];
    }),
    listStudentProfiles().catch((error) => {
      console.error('[APP_SHELL] Failed to load initial students:', error);
      return [];
    }),
  ]);

  return {
    announcements,
    currentStudent: null,
    permissionRequests,
    students,
    user,
  };
}
