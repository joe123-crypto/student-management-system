Student Platform
================

Auth mode:
- Server-side credentials auth via Auth.js and Prisma.
- Required env for local auth flows: `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_ENABLE_MIDDLEWARE`.

**To understand how this application, read the docs index at `docs/README.md`.**

The `docs/` directory is the source of truth for internal architecture, frontend behavior, setup, and troubleshooting, and should be kept up to date after every meaningful code change. Whenever you:

- Add or change routes
- Introduce new feature areas or major components
- Modify data models, storage hooks, or core flows

**Most Recent Updates**
-----------------------

For the most recent code changes and active work context, **always check `docs/memory/RECENT.md`**.

Agents and maintainers **must** update `docs/memory/RECENT.md` after every meaningful code change with a concise summary (max 10 lines) of what was done.
