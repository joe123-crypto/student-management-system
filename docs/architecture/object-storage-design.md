# Object Storage Design

## Status
- Proposed architecture only.
- This document does not mean the schema or routes are implemented yet.

## Goal
Add private object storage alongside PostgreSQL for files that should not live in structured relational tables:

- student profile pictures
- result slip PDFs
- attache-uploaded supporting attachments
- short-lived agent file context

PostgreSQL remains the source of truth for metadata, ownership, access rules, and auditability. The object store holds only file bytes.

## Recommendation
Use an S3-compatible abstraction and start with Cloudflare R2.

Why this is the default recommendation:
- it fits the current Vercel-hosted app without forcing a larger platform change
- it is S3-compatible, which keeps AWS S3 migration feasible later
- it is cost-friendly for file downloads and agent-context retrieval

Design the application so the provider can be swapped between R2 and S3 through environment variables and a thin storage adapter.

## File Classes
| Purpose | Examples | Default visibility | Retention | Notes |
|---|---|---|---|---|
| `PROFILE_IMAGE` | student avatar, profile picture | private | long-lived | serve via signed URL or proxied image route |
| `RESULT_SLIP` | semester result PDF, transcript-like slip | private | long-lived immutable | uploaded once, replace by new version rather than overwrite |
| `ATTACHE_ATTACHMENT` | signed letters, review attachments, supporting files | private | medium/long-lived | optional malware scan before activation |
| `AGENT_CONTEXT` | AI context files, extracted attachments | private | short-lived | expires automatically and should not be public |

## Bucket and Key Layout
Use one logical bucket per environment.

- `student-platform-dev`
- `student-platform-preview`
- `student-platform-prod`

Use student-centric prefixes for student-owned files inside each bucket:

- `students/{studentId}/profile-images/{fileId}/{sanitizedFilename}`
- `students/{studentId}/result-slips/{fileId}/{sanitizedFilename}`
- `students/{studentId}/attache-attachments/{fileId}/{sanitizedFilename}`
- `agent-context/{scope}/{ownerId}/{fileId}/{sanitizedFilename}`

Rules:
- never use user-supplied filenames as the full object key
- include stable identifiers in the key to avoid collisions
- treat result-slip files as immutable objects
- separate agent-context prefixes from user-facing document prefixes

## Metadata Schema
Store file metadata in PostgreSQL and keep it normalized enough for authorization and lifecycle jobs.

### Proposed Prisma Enums
```prisma
enum FilePurpose {
  PROFILE_IMAGE
  RESULT_SLIP
  ATTACHE_ATTACHMENT
  AGENT_CONTEXT
}

enum FileVisibility {
  PRIVATE
  INTERNAL
}

enum FileStatus {
  PENDING_UPLOAD
  ACTIVE
  QUARANTINED
  DELETED
  EXPIRED
}
```

### Proposed Prisma Models
```prisma
model FileAsset {
  id                String         @id @default(cuid())
  purpose           FilePurpose
  visibility        FileVisibility @default(PRIVATE)
  status            FileStatus     @default(PENDING_UPLOAD)
  provider          String
  bucket            String
  objectKey         String         @unique
  originalFilename  String
  sanitizedFilename String
  mimeType          String
  sizeBytes         Int
  checksumSha256    String?
  etag              String?
  studentId         Int?
  personId          Int?
  enrollmentId      Int?
  uploadedByUserId  String?
  supersededById    String?
  scanStatus        String?
  scanDetails       Json?
  metadata          Json?
  expiresAt         DateTime?
  uploadedAt        DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  student           Student?       @relation(fields: [studentId], references: [id], onDelete: SetNull)
  person            Person?        @relation(fields: [personId], references: [id], onDelete: SetNull)
  enrollment        Enrollment?    @relation(fields: [enrollmentId], references: [id], onDelete: SetNull)
  uploadedByUser    AuthUser?      @relation(fields: [uploadedByUserId], references: [id], onDelete: SetNull)
  supersededBy      FileAsset?     @relation("SupersededFileAsset", fields: [supersededById], references: [id], onDelete: SetNull)
  previousVersions  FileAsset[]    @relation("SupersededFileAsset")
  agentContexts     AgentContextFile[]

  @@index([purpose, status])
  @@index([studentId, purpose])
  @@index([personId, purpose])
  @@index([enrollmentId, purpose])
  @@index([uploadedByUserId, createdAt])
  @@index([expiresAt])
}

model AgentContextFile {
  id                String    @id @default(cuid())
  fileAssetId       String
  ownerUserId       String?
  sessionId         String?
  source            String
  purpose           String
  isPinned          Boolean   @default(false)
  lastAccessedAt    DateTime?
  createdAt         DateTime  @default(now())

  fileAsset         FileAsset @relation(fields: [fileAssetId], references: [id], onDelete: Cascade)
  ownerUser         AuthUser? @relation(fields: [ownerUserId], references: [id], onDelete: SetNull)

  @@unique([fileAssetId])
  @@index([ownerUserId, createdAt])
  @@index([sessionId])
}
```

### Field Notes
- `FileAsset` is the canonical metadata row for every stored object.
- `studentId`, `personId`, and `enrollmentId` support different attachment scopes without duplicating file tables.
- `supersededById` allows versioning for profile images and result slips.
- `expiresAt` is required for short-lived agent context and optional elsewhere.
- `metadata` is for non-authoritative extras like dimensions, page count, OCR flags, or extraction summaries.

## Ownership Rules
- students may upload only their own `PROFILE_IMAGE` files unless a future self-service document workflow is added
- students may upload their own `RESULT_SLIP` files as academic proof documents
- attache users may upload `RESULT_SLIP` and `ATTACHE_ATTACHMENT` files
- agent flows may create `AGENT_CONTEXT` files only through server-side orchestration
- direct client writes to storage must always be authorized by a server-issued signed upload policy

## Upload Flow
Use a two-step upload so the database is authoritative before the object becomes active.

### 1. Create Upload Intent
Client calls:

```text
POST /api/files/upload-intents
```

Request body:

```json
{
  "purpose": "PROFILE_IMAGE",
  "studentId": 123,
  "filename": "passport-photo.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 348221
}
```

Server responsibilities:
- authenticate the session
- validate role and ownership
- enforce per-purpose MIME and size limits
- generate the object key
- create `FileAsset` with `status=PENDING_UPLOAD`
- return file metadata plus a signed upload URL or signed POST fields

Response shape:

```json
{
  "file": {
    "id": "ck_file_123",
    "purpose": "PROFILE_IMAGE",
    "status": "PENDING_UPLOAD",
    "objectKey": "students/123/profile-images/ck_file_123/passport-photo.jpg"
  },
  "upload": {
    "method": "PUT",
    "url": "https://signed-upload-url",
    "headers": {
      "Content-Type": "image/jpeg"
    }
  }
}
```

### 2. Upload File Bytes
Client uploads directly to object storage using the signed data from step 1.

### 3. Complete Upload
Client calls:

```text
POST /api/files/{id}/complete
```

Server responsibilities:
- verify the object exists in storage
- fetch provider metadata such as `etag` and final byte size
- optionally queue malware scan or PDF validation
- mark `status=ACTIVE` when the file is safe to use
- write an audit log event

Result-slip and attache-attachment uploads may remain non-downloadable until scan completion if scanning is enabled.

## Download Flow
Never expose raw bucket paths directly for private files.

### Read Metadata
Client first requests application metadata:

```text
GET /api/files/{id}
```

Server returns:
- file summary
- ownership-safe display metadata
- whether download is allowed

### Create Access URL
Client then requests short-lived access:

```text
POST /api/files/{id}/access
```

Server responsibilities:
- authenticate the caller
- verify the caller can access the referenced student or attachment
- reject `PENDING_UPLOAD`, `QUARANTINED`, `DELETED`, or expired files
- generate a short-lived signed download URL, or stream/proxy the object through the app if tighter control is needed
- write an audit log for sensitive document access when appropriate

Response shape:

```json
{
  "downloadUrl": "https://signed-download-url",
  "expiresAt": "2026-03-22T19:20:00.000Z"
}
```

## Deletion and Expiry
- `PROFILE_IMAGE`: soft-delete metadata, optionally hard-delete previous object after replacement grace period
- `RESULT_SLIP`: soft-delete only by default; prefer superseding with a new version for auditability
- `ATTACHE_ATTACHMENT`: soft-delete metadata first, then asynchronous physical deletion
- `AGENT_CONTEXT`: expire automatically via scheduled cleanup using `expiresAt`

Recommended cleanup job:

```text
DELETE expired AGENT_CONTEXT files daily
```

Job steps:
- find `FileAsset` rows with `purpose=AGENT_CONTEXT` and `expiresAt < now()`
- delete object from storage
- set `status=EXPIRED`
- remove or archive the matching `AgentContextFile` row

## Validation Rules
Suggested server-side defaults by file class:

| Purpose | Allowed MIME types | Max size |
|---|---|---|
| `PROFILE_IMAGE` | `image/jpeg`, `image/png`, `image/webp` | 5 MB |
| `RESULT_SLIP` | `application/pdf` | 15 MB |
| `ATTACHE_ATTACHMENT` | `application/pdf`, `image/jpeg`, `image/png` | 20 MB |
| `AGENT_CONTEXT` | `application/pdf`, `text/plain`, `text/markdown`, `application/json`, common office docs only if needed later | 25 MB |

Additional rules:
- compute and persist SHA-256 where practical
- sanitize filenames before persistence
- reject double extensions on executable-like uploads
- verify PDF header/content for claimed PDF files
- optionally strip EXIF from profile images after upload processing

## Security Defaults
- all storage buckets stay private
- all downloads use short-lived signed URLs
- upload intents are server-authenticated and role-checked
- agent-context files must always have `expiresAt`
- sensitive access events should write to `AuditLog`
- never trust client-submitted MIME type without server verification
- do not store file bytes in browser persistent storage

## API Surface
Recommended application routes:

- `POST /api/files/upload-intents`
- `POST /api/files/{id}/complete`
- `GET /api/files/{id}`
- `POST /api/files/{id}/access`
- `DELETE /api/files/{id}`

Optional admin routes later:

- `POST /api/files/{id}/replace`
- `POST /api/files/{id}/quarantine`

## Application Structure
Suggested code ownership:

- `app/api/files/*`: upload intent, complete, metadata, access, delete routes
- `lib/storage/provider.ts`: S3-compatible adapter interface
- `lib/storage/r2-provider.ts`: Cloudflare R2 implementation
- `lib/storage/s3-provider.ts`: AWS S3 implementation
- `lib/files/store.ts`: Prisma reads/writes for `FileAsset`
- `lib/files/policies.ts`: per-purpose validation and authorization rules

### Adapter Interface
```ts
export interface ObjectStorageProvider {
  createSignedUpload(input: {
    objectKey: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<{
    method: 'PUT' | 'POST';
    url: string;
    headers?: Record<string, string>;
    fields?: Record<string, string>;
  }>;

  headObject(objectKey: string): Promise<{
    sizeBytes: number;
    etag?: string;
  } | null>;

  createSignedDownload(input: {
    objectKey: string;
    filename?: string;
    expiresInSeconds: number;
  }): Promise<{
    url: string;
    expiresAt: Date;
  }>;

  deleteObject(objectKey: string): Promise<void>;
}
```

## Environment Variables
Provider-neutral variables:

```text
OBJECT_STORAGE_PROVIDER=r2
OBJECT_STORAGE_BUCKET=student-platform-prod
OBJECT_STORAGE_PUBLIC_BASE_URL=
OBJECT_STORAGE_SIGNED_URL_TTL_SECONDS=300
```

Cloudflare R2 variables:

```text
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_S3_API_URL=
```

AWS S3 variables:

```text
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

## Delivery Phases
### Phase 1
- `FileAsset` metadata model
- upload intents
- signed uploads
- signed downloads
- profile images and result slips only

### Phase 2
- attache attachments
- malware scan or validation queue
- replacement/versioning flows
- audit-log enrichment

### Phase 3
- `AgentContextFile`
- TTL cleanup jobs
- file-to-agent session linking
- extraction metadata and summarization artifacts

## Open Questions
- Should result slips be replaceable or append-only versioned forever
- Do we need image resizing at upload time for profile photos
- Which attachment types should attache users be allowed to upload beyond PDF and images
- Should sensitive downloads be proxied through the app instead of direct signed URLs
