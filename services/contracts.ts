import type { Announcement, PermissionRequest, StudentProfile } from '@/types';
import type { PrototypeDatabase } from '@/test/mock/prototypeDatabase';

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
  createPendingRequest(inscriptionNumber: string, fullName: string, passportNumber: string): PermissionRequest;
}
