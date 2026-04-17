# App Data Schema (DB Layer Only)

## Overview
This schema is derived from the normalized student model used by the backend runtime.
Primary entities are student-centric and grouped into identity, academics, contact, and banking.

For full frontend data contracts (including announcements, permission requests, auth user/session, service contracts, and UI-only fields), see `docs/architecture/frontend-data-model.md`.

## Current Prisma Runtime Models

### `AuthUser`
- Stores credential-bearing auth identities used by Auth.js.
- Key fields: `id`, `role`, `loginId`, `authProvider`, `passwordHash`, `isActive`.

### `AuditLog`
- Stores auth audit events keyed optionally to `AuthUser.id`.
- Key fields: `event`, `metadata`, `ip`, `userAgent`, `createdAt`.

### `Announcement`
- Stores attache-authored announcement feed entries rendered in both attache and student dashboards.
- Key fields: `title`, `content`, `authorName`, `authorUserId`, `createdAt`.

### `PermissionRequest`
- Stores student access requests submitted from the public login flow and reviewed by attaches.
- Key fields: `inscriptionNumber`, `fullName`, `passportNumber`, `status`, `submittedAt`, `reviewedById`.

### `FileAsset`
- Stores object metadata for private files whose bytes live in object storage.
- Key fields: `purpose`, `status`, `provider`, `bucket`, `objectKey`, `studentId`, `progressId`, `uploadedByUserId`.

### `AgentContextFile`
- Stores optional agent-session linkage for file assets that should be tracked separately from user-facing documents.
- Key fields: `fileAssetId`, `ownerUserId`, `sessionId`, `source`, `purpose`.

### Normalized Student Domain
- Student records are persisted across the normalized tables documented below.
- `lib/students/store.ts` maps these tables to and from the shared `StudentProfile` contract.

## Entity Definitions

### `PERSON`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `given_name` | string |  |
| `family_name` | string |  |
| `dob` | date | optional |
| `gender` | string | values seen: `M`, `F` |
| `home_address_id` | number | FK -> `ADDRESS.id` |

### `STUDENT`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `person_id` | number | FK -> `PERSON.id` |
| `inscription_no` | string | unique-like identifier |
| `address_id` | number | FK -> `ADDRESS.id` (current host address) |

### `PASSPORT`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `passport_no` | string |  |
| `issue_date` | date | optional |
| `expiry` | date | optional |
| `person_id` | number | FK -> `PERSON.id` |

### `CONTACT`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `owner_id` | number | FK (logical) -> `PERSON.id` |
| `type` | string | values seen: `EMAIL`, `PHONE`, `EMERGENCY` |
| `value` | string |  |
| `label` | string | examples: `primary`, `mobile`, `name`, `phone` |
| `is_primary` | boolean |  |
| `created_at` | datetime | stored as native timestamp |

### `ADDRESS`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `name` | string | free-form address text |
| `wilaya_id` | number | FK -> `PROVINCE.id` |

### `PROVINCE`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `name` | string | province/city name |
| `country` | string | country or territory label |

### `UNIVERSITY`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `name` | string |  |
| `acronym` | string |  |
| `address_id` | number | FK -> `ADDRESS.id` |

### `DEPARTMENT`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `name` | string |  |
| `description` | string |  |

### `PROGRAM`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `name` | string | major/program title |
| `department_id` | number | FK -> `DEPARTMENT.id` |
| `system_type` | string | e.g. `LMD`, `ENGINEER` |
| `duration_years` | number | total expected duration |

### `AWARDTYPE`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `code` | string | e.g. `LICENCE`, `MASTER`, `INGENIEUR` |
| `label` | string | human-readable award name |

### `PROGRAMAWARD`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `program_id` | number | FK -> `PROGRAM.id` |
| `award_type_id` | number | FK -> `AWARDTYPE.id` |
| `sequence_no` | number | award order within the program |
| `nominal_year` | number | expected year for that award milestone |

### `ENROLLMENT`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `start_year` | number | enrollment start year |
| `end_year` | number | optional expected/actual end year |
| `current_status` | string | values seen: `active`, `dropped`, `graduated`, `pending` |
| `student_id` | number | FK -> `STUDENT.id` |
| `program_id` | number | FK -> `PROGRAM.id` |

### `ENROLLMENTPROGRESS`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `stage_code` | string | milestone/stage code, e.g. `L1`, `M1` |
| `academic_year` | string | academic cycle label |
| `status_date` | date | optional milestone date |
| `result_status` | string | values such as `passed`, `failed`, `repeated`, `pending` |
| `moyenne` | decimal | optional numeric average/mark for the milestone |
| `enrollment_id` | number | FK -> `ENROLLMENT.id` |

### `STUDENTAWARD`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `student_id` | number | FK -> `STUDENT.id` |
| `enrollment_id` | number | FK -> `ENROLLMENT.id` |
| `program_award_id` | number | FK -> `PROGRAMAWARD.id` |
| `award_date` | date | optional award date |
| `status` | string | values such as `awarded`, `pending`, `revoked` |

### `BANK`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `name` | string |  |
| `code` | number | bank code |
| `address_id` | number | FK -> `ADDRESS.id` |

### `BRANCH`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `code` | number | branch code |
| `name` | string |  |
| `address_id` | number | FK -> `ADDRESS.id` |
| `bank_id` | number | FK -> `BANK.id` |

### `ACCOUNT`
| Field | Type | Notes |
|---|---|---|
| `id` | number | PK |
| `account_no` | string |  |
| `rib` | number | account/RIB number |
| `currency` | string | account currency code |
| `date_created` | date | optional |
| `branch_id` | number | FK -> `BRANCH.id` |
| `person_id` | number | FK -> `PERSON.id` |

### `Announcement`
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `title` | string |  |
| `content` | string |  |
| `authorName` | string | rendered author label |
| `authorUserId` | string | optional FK -> `AuthUser.id` |
| `createdAt` | datetime | created timestamp |
| `updatedAt` | datetime | update timestamp |

### `PermissionRequest`
| Field | Type | Notes |
|---|---|---|
| `id` | string | PK |
| `inscriptionNumber` | string | normalized uppercase inscription |
| `fullName` | string | submitter-provided name |
| `passportNumber` | string | normalized uppercase passport |
| `status` | enum | `PENDING`, `APPROVED`, `REJECTED` |
| `submittedAt` | datetime | created timestamp |
| `reviewedAt` | datetime | nullable review timestamp |
| `reviewedById` | string | optional FK -> `AuthUser.id` |

## Relationship Map

```mermaid
erDiagram
  AUTHUSER ||--o{ AUDITLOG : "writes"
  AUTHUSER ||--o{ ANNOUNCEMENT : "authors"
  AUTHUSER ||--o{ PERMISSIONREQUEST : "reviews"
  PERSON ||--o| STUDENT : "has student profile"
  PERSON ||--o{ PASSPORT : "has"
  PERSON ||--o{ CONTACT : "owns"
  PERSON ||--o{ ACCOUNT : "holds"
  ADDRESS ||--o{ PERSON : "home_address_id"
  ADDRESS ||--o{ STUDENT : "address_id"
  PROVINCE ||--o{ ADDRESS : "contains"
  ADDRESS ||--o{ UNIVERSITY : "location"
  ADDRESS ||--o{ BANK : "location"
  ADDRESS ||--o{ BRANCH : "location"
  BANK ||--o{ BRANCH : "has"
  BRANCH ||--o{ ACCOUNT : "hosts"
  STUDENT ||--o{ ENROLLMENT : "enrolls"
  PROGRAM ||--o{ ENROLLMENT : "selected in"
  DEPARTMENT ||--o{ PROGRAM : "owns"
  PROGRAM ||--o{ PROGRAMAWARD : "defines awards"
  AWARDTYPE ||--o{ PROGRAMAWARD : "classifies"
  ENROLLMENT ||--o{ ENROLLMENTPROGRESS : "tracks"
  STUDENT ||--o{ STUDENTAWARD : "earns"
  ENROLLMENT ||--o{ STUDENTAWARD : "produces"
  PROGRAMAWARD ||--o{ STUDENTAWARD : "awards"
```

## Notes
- The runtime backend persists this schema in PostgreSQL via Prisma.
- `CONTACT.owner_id` behaves as a polymorphic owner field in name, but current usage links it to `PERSON.id`.
- `STUDENT` references two addresses: `PERSON.home_address_id` (home) and `STUDENT.address_id` (current/host).
- `StudentProfile.id` is derived at the mapping layer as `student-{STUDENT.id}` rather than stored as a separate column.
- `ENROLLMENTPROGRESS.moyenne` stores the optional numeric average for a stage; the UI compatibility layer still exposes a string `grade` alongside it.
