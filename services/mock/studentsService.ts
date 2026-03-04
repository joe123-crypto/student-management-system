import {
  createPrototypeDatabase,
  deleteStudentsFromDatabase,
  getStudentProfilesFromDatabase,
  importStudentProfilesToDatabase,
  isPrototypeDatabase,
  PROTOTYPE_DATABASE_STORAGE_KEY,
  updateStudentProfileInDatabase,
} from '@/mock/prototypeDatabase';
import { getFromStorage } from '@/components/shell/shared/storage';
import type { StudentsService } from '@/services/contracts';

export const mockStudentsService: StudentsService = {
  loadDatabase() {
    const stored = getFromStorage<unknown>(PROTOTYPE_DATABASE_STORAGE_KEY, null);
    return isPrototypeDatabase(stored) ? stored : createPrototypeDatabase();
  },
  saveDatabase(database) {
    window.localStorage.setItem(PROTOTYPE_DATABASE_STORAGE_KEY, JSON.stringify(database));
  },
  getProfiles(database) {
    return getStudentProfilesFromDatabase(database);
  },
  updateStudent(database, id, profile) {
    return updateStudentProfileInDatabase(database, id, profile);
  },
  deleteStudents(database, studentIds) {
    return deleteStudentsFromDatabase(database, studentIds);
  },
  importStudents(database, records, mode) {
    return importStudentProfilesToDatabase(database, records, mode);
  },
};
