import type { StudentProfile } from '@/types';

export type StudentSortBy = 'name' | 'inscription';
export type StudentStatusFilter = 'ALL' | StudentProfile['status'];
export type StudentDataField =
  | 'fullName'
  | 'givenName'
  | 'familyName'
  | 'inscription'
  | 'dateOfBirth'
  | 'gender'
  | 'nationality'
  | 'passportNumber'
  | 'passportIssueDate'
  | 'passportExpiryDate'
  | 'passportIssuingCountry'
  | 'email'
  | 'emergencyContactName'
  | 'emergencyContactPhone'
  | 'university'
  | 'universityAcronym'
  | 'universityCity'
  | 'department'
  | 'program'
  | 'degreeLevel'
  | 'systemType'
  | 'startDate'
  | 'expectedEndDate'
  | 'status'
  | 'phone'
  | 'bankName'
  | 'branchName'
  | 'branchAddress'
  | 'branchCode'
  | 'bankCode'
  | 'accountNumber'
  | 'iban'
  | 'accountCreatedDate'
  | 'currentHostAddress'
  | 'homeCountryAddress'
  | 'wilaya'
  | 'country';
export type QueryField = 'all' | StudentDataField;
export type StudentReturnField = StudentDataField;
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

