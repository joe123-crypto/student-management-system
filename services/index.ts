import type {
  AnnouncementsService,
  AuthService,
  PermissionsService,
  StudentsService,
} from '@/services/contracts';
import { mockAnnouncementsService } from '@/services/mock/announcementsService';
import { mockAuthService } from '@/services/mock/authService';
import { mockPermissionsService } from '@/services/mock/permissionsService';
import { mockStudentsService } from '@/services/mock/studentsService';

interface ServiceContainer {
  auth: AuthService;
  students: StudentsService;
  announcements: AnnouncementsService;
  permissions: PermissionsService;
}

export const services: ServiceContainer = {
  auth: mockAuthService,
  students: mockStudentsService,
  announcements: mockAnnouncementsService,
  permissions: mockPermissionsService,
};

