# Data Model Integration Diagrams

This document visualizes how the normalized DB schema (`app-schema.md`) and frontend model (`frontend-data-model.md`) fit together.

## 1) Layered Architecture

```mermaid
flowchart LR
  subgraph DB[Normalized DB Layer]
    PERSON[(PERSON)]
    STUDENT[(STUDENT)]
    PASSPORT[(PASSPORT)]
    ENROLLMENT[(ENROLLMENT)]
    PROGRAM[(PROGRAM + PROGRAMTYPE + DEPARTMENT)]
    CONTACT[(CONTACT)]
    ADDRESS[(ADDRESS + PROVINCE)]
    ACCOUNT[(ACCOUNT + BRANCH + BANK)]
    PROGRESS[(PROGRESS)]
  end

  subgraph MAP[Mapping Layer]
    M1[list/find student mapping\n(lib/students/store.ts)]
    M2[updateStudentProfile\n(lib/students/store.ts)]
    M3[import/ensure student creation\n(lib/students/store.ts)]
  end

  subgraph FE[Frontend Domain Layer]
    SP[StudentProfile]
    UI[Student + Attache UI]
    SVC[studentsService contract]
  end

  DB --> M1 --> SP
  UI --> SVC --> M2 --> DB
  UI --> SVC --> M3 --> DB
  SP --> UI
```

## 2) Read Path (DB -> StudentProfile)

```mermaid
flowchart TD
  S[STUDENT.id/person_id/inscription_no/address_id] --> P[PERSON\nname, dob, gender]
  P --> Pass[PASSPORT\npassport_no, dates]
  S --> E[Latest ENROLLMENT\nregistration_no, status]
  E --> Prog[PROGRAM -> PROGRAMTYPE/DEPARTMENT]
  P --> C[CONTACT\nemail/phone/emergency]
  P --> A1[PERSON.home_address_id -> ADDRESS]
  S --> A2[STUDENT.address_id -> ADDRESS]
  P --> Acct[ACCOUNT -> BRANCH -> BANK]
  E --> Hist[PROGRESS rows]

  P --> Out[StudentProfile.student]
  Pass --> Out
  E --> Out
  Prog --> Out
  C --> Out
  A1 --> Out
  A2 --> Out
  Acct --> Out
  Hist --> Out

  Note1[profilePicture = frontend-only]
  Note2[nationality/issuingCountry = derived]
  Note1 --> Out
  Note2 --> Out
```

## 3) Write Path (StudentProfile patch -> DB)

```mermaid
flowchart TD
  UI[UI edit/import] --> Patch[Partial or full StudentProfile]
  Patch --> U[updateStudentProfileInDatabase]
  Patch --> I[addStudentProfileToDatabase]

  U --> U1[Find STUDENT by StudentProfile.id]
  U1 --> U2[Use STUDENT.person_id to update PERSON]
  U2 --> U3[Update/create PASSPORT, CONTACT, ACCOUNT]
  U3 --> U4[Resolve addresses and update STUDENT.address_id + PERSON.home_address_id]
  U4 --> U5[Update latest ENROLLMENT/PROGRESS where provided]

  I --> I1[Create PERSON]
  I1 --> I2[Create STUDENT with person_id]
  I2 --> I3[Create related PASSPORT/CONTACT/ACCOUNT/ENROLLMENT/PROGRESS]
```

## 4) Key Identity and Join Rules

```mermaid
flowchart LR
  SID[StudentProfile.id\n"student-{STUDENT.id}"] --> STUDID[STUDENT.id]
  STUDID --> PID[STUDENT.person_id]
  PID --> PERSONID[PERSON.id]
  PERSONID --> CONTACTS[CONTACT.owner_id]
  PERSONID --> PASSID[PASSPORT.person_id]
  PERSONID --> ACCTID[ACCOUNT.person_id]
  STUDID --> ENRID[ENROLLMENT.student_id]
  ENRID --> PROGRID[PROGRESS.enrollment_id]
```

## 5) Practical Interpretation

- `app-schema.md` is the source of truth for storage structure and keys.
- `frontend-data-model.md` is the source of truth for UI/service contracts.
- Mapper functions in `lib/students/store.ts` are the runtime integration contract between both layers.
- Field differences (for example `profilePicture`, combined address strings, derived nationality) are expected denormalization decisions at the frontend layer.
