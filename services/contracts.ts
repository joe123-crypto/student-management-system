import type { Announcement, PermissionRequest, StudentProfile, User } from '@/types';
import type { PrototypeDatabase } from '@/mock/prototypeDatabase';

export type AuthPasswordStore = Record<string, string>;

export interface AuthService {
  loadUser(): User | null;
  saveUser(user: User | null): void;
  loadPasswordStore(): AuthPasswordStore;
  savePasswordStore(passwords: AuthPasswordStore): void;
}

export interface StudentsService {
  loadDatabase(): PrototypeDatabase;
  saveDatabase(database: PrototypeDatabase): void;
  getProfiles(database: PrototypeDatabase): StudentProfile[];
  updateStudent(database: PrototypeDatabase, id: string, profile: Partial<StudentProfile>): PrototypeDatabase;
  deleteStudents(database: PrototypeDatabase, studentIds: string[]): PrototypeDatabase;
  importStudents(database: PrototypeDatabase, records: StudentProfile[], mode: 'append' | 'replace'): PrototypeDatabase;
}

export interface AnnouncementsService {
  loadAnnouncements(): Announcement[];
  saveAnnouncements(announcements: Announcement[]): void;
}

export interface PermissionsService {
  loadPermissionRequests(): PermissionRequest[];
  savePermissionRequests(permissionRequests: PermissionRequest[]): void;
  createPendingRequest(inscriptionNumber: string): PermissionRequest;
}

