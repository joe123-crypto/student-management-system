import type {
  AnnouncementsService,
  PermissionsService,
  StudentsService,
} from '@/services/contracts';
import {
  runtimeAnnouncementsService,
  runtimePermissionsService,
  runtimeStudentsService,
} from '@/services/runtime';
import { isMockDbEnabled } from '@/test/mock/config';
import { mockAnnouncementsService } from '@/test/mock/services/announcementsService';
import { mockPermissionsService } from '@/test/mock/services/permissionsService';
import { mockStudentsService } from '@/test/mock/services/studentsService';

interface ServiceContainer {
  students: StudentsService;
  announcements: AnnouncementsService;
  permissions: PermissionsService;
}

export const services: ServiceContainer = {
  students: isMockDbEnabled() ? mockStudentsService : runtimeStudentsService,
  announcements: isMockDbEnabled() ? mockAnnouncementsService : runtimeAnnouncementsService,
  permissions: isMockDbEnabled() ? mockPermissionsService : runtimePermissionsService,
};
