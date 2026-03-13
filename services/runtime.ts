import type {
  AnnouncementsService,
  PermissionsService,
  StudentsService,
} from '@/services/contracts';

export const runtimeAnnouncementsService: AnnouncementsService = {
  loadAnnouncements() {
    return [];
  },
  saveAnnouncements() {},
};

export const runtimePermissionsService: PermissionsService = {
  loadPermissionRequests() {
    return [];
  },
  savePermissionRequests() {},
  createPendingRequest(inscriptionNumber, fullName, passportNumber) {
    return {
      id: Math.random().toString(36).slice(2, 11),
      inscriptionNumber: inscriptionNumber.toUpperCase(),
      fullName: fullName.trim(),
      passportNumber: passportNumber.trim().toUpperCase(),
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };
  },
};

export const runtimeStudentsService: StudentsService = {
  loadDatabase() {
    throw new Error('Prototype student database is only available when NEXT_PUBLIC_USE_MOCK_DB=true.');
  },
  saveDatabase() {},
  getProfiles() {
    return [];
  },
  updateStudent() {
    throw new Error('Prototype student database is only available when NEXT_PUBLIC_USE_MOCK_DB=true.');
  },
  deleteStudents() {
    throw new Error('Prototype student database is only available when NEXT_PUBLIC_USE_MOCK_DB=true.');
  },
  importStudents() {
    throw new Error('Prototype student database is only available when NEXT_PUBLIC_USE_MOCK_DB=true.');
  },
};
