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
