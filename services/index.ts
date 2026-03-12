import type {
  AnnouncementsService,
  PermissionsService,
  StudentsService,
} from '@/services/contracts';
import { mockAnnouncementsService } from '@/test/mock/services/announcementsService';
import { mockPermissionsService } from '@/test/mock/services/permissionsService';
import { mockStudentsService } from '@/test/mock/services/studentsService';

interface ServiceContainer {
  students: StudentsService;
  announcements: AnnouncementsService;
  permissions: PermissionsService;
}

export const services: ServiceContainer = {
  students: mockStudentsService,
  announcements: mockAnnouncementsService,
  permissions: mockPermissionsService,
};
