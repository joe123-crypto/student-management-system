// Schema definitions for the prototype in-browser database.

export interface PERSON {
  id: number;
  given_name: string;
  family_name: string;
  dob: string;
  gender: string;
  home_address_id: number;
}

export interface STUDENT {
  id: number;
  person_id: number;
  inscription_no: string;
  address_id: number;
}

export interface PASSPORT {
  id: number;
  passport_no: string;
  issue_date: string;
  expiry: string;
  person_id: number;
}

export interface CONTACT {
  id: number;
  owner_id: number;
  type: string;
  value: string;
  label: string;
  is_primary: boolean;
  created_at: string;
}

export interface ADDRESS {
  id: number;
  name: string;
  wilaya_id: number;
}

export interface PROVINCE {
  id: number;
  name: string;
  country: string;
}

export interface UNIVERSITY {
  id: number;
  name: string;
  acronym: string;
  address_id: number;
}

export interface DEPARTMENT {
  id: number;
  name: string;
  description: string;
}

export interface PROGRAM {
  id: number;
  name: string;
  department_id: number;
  system_type: string;
  duration_years: number;
}

export interface AWARDTYPE {
  id: number;
  code: string;
  label: string;
}

export interface PROGRAMAWARD {
  id: number;
  program_id: number;
  award_type_id: number;
  sequence_no: number;
  nominal_year: number;
}

export interface ENROLLMENT {
  id: number;
  start_year: number;
  end_year: number | null;
  current_status: string;
  student_id: number;
  program_id: number;
}

export interface ENROLLMENTPROGRESS {
  id: number;
  stage_code: string;
  academic_year: string;
  status_date: string;
  result_status: string;
  moyenne: number | null;
  enrollment_id: number;
}

export interface STUDENTAWARD {
  id: number;
  student_id: number;
  enrollment_id: number;
  program_award_id: number;
  award_date: string | null;
  status: string;
}

export interface BANK {
  id: number;
  name: string;
  code: number;
  address_id: number;
}

export interface BRANCH {
  id: number;
  code: number;
  name: string;
  address_id: number;
  bank_id: number;
}

export interface ACCOUNT {
  id: number;
  account_no: string;
  rib: number;
  date_created: string;
  branch_id: number;
  person_id: number;
}

export interface PrototypeDatabase {
  PERSON: PERSON[];
  STUDENT: STUDENT[];
  PASSPORT: PASSPORT[];
  CONTACT: CONTACT[];
  ADDRESS: ADDRESS[];
  PROVINCE: PROVINCE[];
  UNIVERSITY: UNIVERSITY[];
  DEPARTMENT: DEPARTMENT[];
  PROGRAM: PROGRAM[];
  AWARDTYPE: AWARDTYPE[];
  PROGRAMAWARD: PROGRAMAWARD[];
  ENROLLMENT: ENROLLMENT[];
  ENROLLMENTPROGRESS: ENROLLMENTPROGRESS[];
  STUDENTAWARD: STUDENTAWARD[];
  BANK: BANK[];
  BRANCH: BRANCH[];
  ACCOUNT: ACCOUNT[];
}

