# Frontend Data Model

## Scope
This document is the complete reference for frontend data contracts used by the Student Platform.

- Canonical source for shared domain shapes: `types.ts`
- Canonical source for service contracts: `services/contracts.ts`
- Canonical source for attache dashboard query/log types: `components/features/attache/types.ts`
- Canonical source for normalized student storage schema: `mock/prototypeSchema.ts`

`docs/architecture/app-schema.md` remains the DB-only schema reference.

## Persistence
### Local Storage Keys
| Constant | Key | Domain |
|---|---|---|
| `PROTOTYPE_DATABASE_STORAGE_KEY` | `prototype_database_v1` | Normalized student database |
| `ANNOUNCEMENTS_STORAGE_KEY` | `announcements` | Announcements feed |
| `PERMISSION_REQUESTS_STORAGE_KEY` | `permission_requests_v1` | Permission requests |
| `USER_STORAGE_KEY` | `user` | Auth session |
| `AUTH_PASSWORDS_STORAGE_KEY` | `auth_passwords_v1` | Student password store |

### Storage Ownership
- Student records are persisted in normalized table arrays (`PrototypeDatabase`), then mapped into `StudentProfile`.
- Announcements, permission requests, auth user, and password store are independent stores.
- Some fields are frontend-only or derived and are not first-class normalized columns.

## Shared Types (`types.ts`)
### `UserRole`
- Values: `STUDENT`, `ATTACHE`

### `StudentDetails`
- `fullName`, `givenName`, `familyName`, `inscriptionNumber`, `registrationNumber`, `dateOfBirth`, `gender`, `nationality`, `profilePicture`

### `PassportDetails`
- `passportNumber`, `issueDate`, `expiryDate`, `issuingCountry`

### `UniversityDetails`
- `universityName`, `acronym`, `campus`, `city`, `department`

### `ProgramDetails`
- `degreeLevel`, `major`, `startDate`, `expectedEndDate`, `programType`

### `BankAccountDetails`
- `accountHolderName`, `accountNumber`, `iban`, `swiftCode`, `dateCreated`

### `BankDetails`
- `bankName`, `branchName`, `branchAddress`, `branchCode`

### `ContactDetails`
- `email`, `phone`, `emergencyContactName`, `emergencyContactPhone`

### `AddressDetails`
- `homeCountryAddress`, `currentHostAddress`, `street`, `city`, `state`, `countryCode`, `wilaya`

### `ProgressDetails`
- `id`, `date`, `year`, `level`, `grade`, `status`, `proofDocument`

### `StudentProfile`
- `id`, `student`, `passport`, `university`, `program`, `bankAccount`, `bank`, `contact`, `address`, `status`, `academicHistory`

### `Announcement`
- `id`, `title`, `content`, `date`, `author`

### `PermissionRequest`
- `id`, `inscriptionNumber`, `fullName`, `passportNumber`, `status`, `submittedAt`

### `User`
- `id`, `subject`, `loginId`, `authProvider`, `role`

## Service Contracts (`services/contracts.ts`)
### `AuthPasswordStore`
- Record map: `loginId -> password`

### `AuthService`
- `loadUser`, `saveUser`, `loadPasswordStore`, `savePasswordStore`

### `StudentsService`
- `loadDatabase`, `saveDatabase`, `getProfiles`, `updateStudent`, `deleteStudents`, `importStudents`

### `AnnouncementsService`
- `loadAnnouncements`, `saveAnnouncements`

### `PermissionsService`
- `loadPermissionRequests`, `savePermissionRequests`, `createPendingRequest`

## Attache Domain Types (`components/features/attache/types.ts`)
### `StudentSortBy`
- Values: `name`, `inscription`

### `StudentStatusFilter`
- Values: `ALL` plus `StudentProfile.status`

### `MissingDataFilter`
- Values: `ALL`, `ANY_MISSING`, `MISSING_PROFILE`, `MISSING_BANK`, `NONE`

### `DocumentStatusFilter`
- Values: `ALL`, `PENDING`, `COMPLETED`, `MISSING`

### `StudentQueryState`
- `searchQuery`, `status`, `sortBy`, `university`, `program`, `academicYear`, `missingData`, `startDateFrom`, `startDateTo`, `documentStatus`, `duplicatesOnly`

### `QualityFlagResult`
- `studentId`, `items`

### `DuplicateGroup`
- `key`, `value`, `label`, `studentIds`

### `CommunicationLogEntry`
- `id`, `sentAt`, `recipientCount`, `channel`, `template`

### `ReportColumnOption`
- `key`, `label`

## StudentProfile to Normalized DB Mapping
| Frontend path | Source table/field(s) | Notes |
|---|---|---|
| `id` | `STUDENT.id` | Serialized as `student-{id}` |
| `student.givenName` | `PERSON.given_name` | |
| `student.familyName` | `PERSON.family_name` | |
| `student.fullName` | Derived from `PERSON.given_name + family_name` | Derived |
| `student.inscriptionNumber` | `STUDENT.inscription_no` | |
| `student.registrationNumber` | `ENROLLMENT.registration_no` | Latest enrollment |
| `student.dateOfBirth` | `PERSON.dob` | |
| `student.gender` | `PERSON.gender` | Normalized in mapper |
| `student.nationality` | Derived from `PASSPORT.passport_no` prefix | Derived |
| `student.profilePicture` | Not in normalized DB | Frontend-only |
| `passport.passportNumber` | `PASSPORT.passport_no` | |
| `passport.issueDate` | `PASSPORT.issue_date` | |
| `passport.expiryDate` | `PASSPORT.expiry` | |
| `passport.issuingCountry` | Derived from `PASSPORT.passport_no` prefix | Derived |
| `university.universityName` | `UNIVERSITY.name` | |
| `university.acronym` | `UNIVERSITY.acronym` | |
| `university.campus` | `ADDRESS.name` via `UNIVERSITY.address_id` | |
| `university.city` | `PROVINCE.name` via university address | |
| `university.department` | `DEPARTMENT.name` via program | |
| `program.degreeLevel` | `PROGRAMTYPE.name` | |
| `program.major` | `PROGRAM.name` | |
| `program.startDate` | `ENROLLMENT.date_enrolled` | |
| `program.expectedEndDate` | Derived from start date and `PROGRAMTYPE.default_duration` | Derived |
| `program.programType` | Not mapped in current database mapper | Optional frontend field |
| `bankAccount.accountHolderName` | Derived from student full name | Derived |
| `bankAccount.accountNumber` | `ACCOUNT.account_no` | |
| `bankAccount.iban` | `ACCOUNT.rib` | Stringified in mapper |
| `bankAccount.swiftCode` | `BANK.code` | Stringified in mapper |
| `bankAccount.dateCreated` | `ACCOUNT.date_created` | |
| `bank.bankName` | `BANK.name` | |
| `bank.branchName` | `BRANCH.name` | |
| `bank.branchAddress` | `ADDRESS.name` via `BRANCH.address_id` | |
| `bank.branchCode` | `BRANCH.code` | Stringified in mapper |
| `contact.email` | `CONTACT.value` where `type=EMAIL` | |
| `contact.phone` | `CONTACT.value` where `type=PHONE` | |
| `contact.emergencyContactName` | `CONTACT.value` where `type=EMERGENCY,label=name` | |
| `contact.emergencyContactPhone` | `CONTACT.value` where `type=EMERGENCY,label=phone` | |
| `address.homeCountryAddress` | `ADDRESS.name` + province via `PERSON.home_address_id` | Joined string |
| `address.currentHostAddress` | `ADDRESS.name` + province via `STUDENT.address_id` | Joined string |
| `address.street/city/state/countryCode/wilaya` | Not mapped in current database mapper | Optional frontend fields |
| `status` | `ENROLLMENT.status` | Normalized to `PENDING/ACTIVE/COMPLETED` |
| `academicHistory[].id` | `PROGRESS.id` | Serialized as `progress-{id}` |
| `academicHistory[].date` | `PROGRESS.date` | |
| `academicHistory[].year` | `PROGRESS.semester` | |
| `academicHistory[].level` | `PROGRESS.level` | |
| `academicHistory[].grade` | `PROGRESS.grade` | |
| `academicHistory[].status` | `PROGRESS.status` | |
| `academicHistory[].proofDocument` | Not in normalized DB | Frontend-only |

## Coverage Rules
- New exported data type aliases, enums, or interfaces in `types.ts`, `services/contracts.ts`, or `components/features/attache/types.ts` must be added as sections in this document.
- New storage key constants must be added to the Local Storage Keys table.
- Run `npm run docs:check` before commit to detect drift.
