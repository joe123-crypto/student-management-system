# Setup and Local Development

## Prerequisites
- Node.js (LTS recommended)
- npm
- PostgreSQL connection string for auth (`DATABASE_URL`)

## Install
```bash
npm install
```

## Environment
Copy `.env.example` into `.env` and configure:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_ENABLE_MIDDLEWARE`
- `SEED_AUTH_PASSWORD`

Sign-in uses the Prisma auth users created by [`prisma/seed.ts`](/c:/Users/Joe/Documents/workspace/Student%20Platform/prisma/seed.ts). `NEXT_PUBLIC_USE_MOCK_DB` only controls the remaining mock data surfaces, not authentication.

With `NEXT_PUBLIC_USE_MOCK_DB=false`, the runtime now also persists announcements, permission requests, and password changes through the Prisma-backed API routes.

Managed file uploads also require:
- `OBJECT_STORAGE_PROVIDER=r2`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET` or environment-specific `R2_BUCKET_DEV` / `R2_BUCKET_PREVIEW` / `R2_BUCKET_PROD`
- optional `R2_S3_API_URL`
- optional `OBJECT_STORAGE_SIGNED_URL_TTL_SECONDS`

For direct browser uploads, configure the R2 bucket CORS policy to allow your frontend origin(s) to send `PUT` requests with `Content-Type`.

## Run
```bash
npm run dev
```

## Useful Commands
- `npm run lint`
- `npm run docs:check`
- `npm run typecheck`
- `npm run prisma:migrate:deploy`
- `npx prisma migrate deploy`
- `npx prisma db seed`

## Deployment Migrations
GitHub Actions applies Prisma migrations before preview and production deploys.

Configure a `DATABASE_URL` GitHub environment secret for:
- `preview`
- `production`

Each secret should point to the Neon database or branch for that environment.

## First Read for New Maintainers
1. `docs/README.md`
2. `docs/frontend/README.md`
3. `docs/architecture/README.md`
4. `docs/troubleshooting/README.md`
