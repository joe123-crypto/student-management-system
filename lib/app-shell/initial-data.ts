import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import authConfig from '@/auth.config';
import { listAnnouncements } from '@/lib/announcements/store';
import { listPermissionRequests } from '@/lib/permission-requests/store';
import { prisma } from '@/lib/db';
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

const APP_SHELL_DB_MAX_ATTEMPTS = 2;
const APP_SHELL_DB_RETRY_DELAY_MS = 750;

function isRetryableDatabaseConnectionError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1001')
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function warmAppShellDatabaseConnection(): Promise<void> {
  for (let attempt = 1; attempt <= APP_SHELL_DB_MAX_ATTEMPTS; attempt += 1) {
    try {
      await prisma.$connect();
      await prisma.$queryRawUnsafe('SELECT 1');
      return;
    } catch (error) {
      if (!isRetryableDatabaseConnectionError(error) || attempt === APP_SHELL_DB_MAX_ATTEMPTS) {
        throw error;
      }

      console.warn(
        `[APP_SHELL] Retrying initial database connection (attempt ${attempt + 1}/${APP_SHELL_DB_MAX_ATTEMPTS}).`,
        error,
      );
      await delay(APP_SHELL_DB_RETRY_DELAY_MS * attempt);
    }
  }
}

async function loadWithDatabaseRetry<T>(loader: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= APP_SHELL_DB_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await loader();
    } catch (error) {
      if (!isRetryableDatabaseConnectionError(error) || attempt === APP_SHELL_DB_MAX_ATTEMPTS) {
        throw error;
      }

      await delay(APP_SHELL_DB_RETRY_DELAY_MS * attempt);
    }
  }

  throw new Error('App shell database retry exhausted unexpectedly.');
}

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

  await warmAppShellDatabaseConnection().catch((error) => {
    console.error('[APP_SHELL] Failed to warm initial database connection:', error);
  });

  if (user.role === UserRole.STUDENT) {
    const [announcements, currentStudent] = await Promise.all([
      loadWithDatabaseRetry(() => listAnnouncements()).catch((error) => {
        console.error('[APP_SHELL] Failed to load initial announcements:', error);
        return [];
      }),
      loadWithDatabaseRetry(() =>
        ensureStudentProfileForIdentity({
          id: user.id,
          loginId: user.loginId,
          role: user.role,
        }),
      ).catch((error) => {
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
    loadWithDatabaseRetry(() => listAnnouncements()).catch((error) => {
      console.error('[APP_SHELL] Failed to load initial announcements:', error);
      return [];
    }),
    loadWithDatabaseRetry(() => listPermissionRequests()).catch((error) => {
      console.error('[APP_SHELL] Failed to load initial permission requests:', error);
      return [];
    }),
    loadWithDatabaseRetry(() => listStudentProfiles()).catch((error) => {
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
