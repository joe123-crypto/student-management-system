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

export interface PROGRAMTYPE {
  id: number;
  name: string;
  default_duration: number;
}

export interface PROGRAM {
  id: number;
  name: string;
  description: string;
  department_id: number;
  programtype_id: number;
}

export interface ENROLLMENT {
  id: number;
  registration_no: string;
  date_enrolled: string;
  status: string;
  student_id: number;
  program_id: number;
}

export interface PROGRESS {
  id: number;
  date: string;
  semester: string;
  level: string;
  grade: string;
  status: string;
  enrollment_id: number;
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
  PROGRAMTYPE: PROGRAMTYPE[];
  PROGRAM: PROGRAM[];
  ENROLLMENT: ENROLLMENT[];
  PROGRESS: PROGRESS[];
  BANK: BANK[];
  BRANCH: BRANCH[];
  ACCOUNT: ACCOUNT[];
}

