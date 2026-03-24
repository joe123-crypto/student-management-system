
export enum UserRole {
  STUDENT = 'STUDENT',
  ATTACHE = 'ATTACHE'
}

export interface StudentDetails {
  fullName: string;
  givenName: string;
  familyName: string;
  inscriptionNumber: string;
  registrationNumber?: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'Other';
  nationality: string;
  profilePicture?: string;
}

export interface PassportDetails {
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
}

export interface UniversityDetails {
  universityName: string;
  acronym: string;
  campus: string;
  city: string;
  department?: string;
}

export interface ProgramDetails {
  degreeLevel: string;
  major: string;
  startDate: string;
  expectedEndDate: string;
  programType?: string;
}

export interface BankAccountDetails {
  accountHolderName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  dateCreated?: string;
}

export interface BankDetails {
  bankName: string;
  branchName: string;
  branchAddress: string;
  branchCode: string;
}

export interface ContactDetails {
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface AddressDetails {
  homeCountryAddress: string;
  currentHostAddress: string;
  street?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  wilaya?: string;
}

export interface ProgressDetails {
  id: string;
  date: string;
  year: string;
  level: string;
  grade: string;
  status: string;
  proofDocument?: string; // authenticated file URL/reference for transcript/document
}

export interface StudentProfile {
  id: string;
  student: StudentDetails;
  passport: PassportDetails;
  university: UniversityDetails;
  program: ProgramDetails;
  bankAccount: BankAccountDetails;
  bank: BankDetails;
  contact: ContactDetails;
  address: AddressDetails;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  academicHistory?: ProgressDetails[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface PermissionRequest {
  id: string;
  inscriptionNumber: string;
  fullName: string;
  passportNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface User {
  id: string;
  subject: string;
  loginId: string;
  authProvider: 'student_inscription' | 'attache_email';
  role: UserRole;
}

export interface AgentChatMessage {
  id: string;
  author: 'assistant' | 'user';
  content: string;
  createdAt: string;
}

export interface AgentThread {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: AgentChatMessage[];
}

export interface AttacheAgentContext {
  filteredStudentIds: string[];
  selectedStudentIds: string[];
  searchQuery: string;
  statusFilter: string;
  university: string;
  program: string;
  duplicatesOnly: boolean;
}


