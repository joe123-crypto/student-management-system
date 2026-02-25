import type { StudentProfile } from '@/types';

export type StudentSortBy = 'name' | 'inscription';
export type StudentStatusFilter = 'ALL' | StudentProfile['status'];
export type MissingDataFilter = 'ALL' | 'ANY_MISSING' | 'MISSING_PROFILE' | 'MISSING_BANK' | 'NONE';
export type DocumentStatusFilter = 'ALL' | 'PENDING' | 'COMPLETED' | 'MISSING';

export interface StudentQueryState {
  searchQuery: string;
  status: StudentStatusFilter;
  sortBy: StudentSortBy;
  university: string;
  program: string;
  academicYear: string;
  missingData: MissingDataFilter;
  startDateFrom: string;
  startDateTo: string;
  documentStatus: DocumentStatusFilter;
  duplicatesOnly: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  query: StudentQueryState;
  createdAt: string;
}

export interface QualityFlagResult {
  studentId: string;
  items: string[];
}

export interface DuplicateGroup {
  key: string;
  value: string;
  label: string;
  studentIds: string[];
}

export interface CommunicationLogEntry {
  id: string;
  sentAt: string;
  recipientCount: number;
  channel: 'EMAIL' | 'SMS';
  template: string;
}

export interface ReportColumnOption {
  key: string;
  label: string;
}

