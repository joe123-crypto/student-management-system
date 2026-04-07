import type { StudentProfile } from '@/types';

export type StudentSortBy = 'name' | 'inscription';
export type StudentStatusFilter = 'ALL' | StudentProfile['status'];
export type QueryField = 'all' | 'fullName' | 'inscription' | 'email' | 'university' | 'program';
export type StudentReturnField =
  | 'fullName'
  | 'inscription'
  | 'email'
  | 'university'
  | 'program'
  | 'degreeLevel'
  | 'status'
  | 'phone';
export type MissingDataFilter = 'ALL' | 'ANY_MISSING' | 'MISSING_PROFILE' | 'MISSING_BANK' | 'NONE';
export type DocumentStatusFilter = 'ALL' | 'PENDING' | 'COMPLETED' | 'MISSING';

export interface DatabaseQueryClause {
  id: string;
  value: string;
  field: QueryField;
}

export interface StudentQueryState {
  searchQuery: string;
  queryField: QueryField;
  queryClauses: DatabaseQueryClause[];
  returnFields: StudentReturnField[];
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

