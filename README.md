Student Platform
================

Auth mode:
- Production: set `NEXT_PUBLIC_DEMO_MODE=false` and provide `NEXT_PUBLIC_ATTACHE_PASSWORD`.
- Demo: set `NEXT_PUBLIC_DEMO_MODE=true` to enable demo credential fallbacks (for pre-backend demonstrations).

**To understand how this application works, including architecture, routing, data model, and feature breakdown, read `docs/README.md`.**

That document is the **single source of truth** for internal architecture and should be **kept up to date after every meaningful code change**. Whenever you:

- Add or change routes
- Introduce new feature areas or major components
- Modify data models, storage hooks, or core flows

**Most Recent Updates**
-----------------------

For the most recent code changes and active work context, **always check `docs/memory/RECENT.md`**.

Agents and maintainers **must** update `docs/memory/RECENT.md` after every meaningful code change with a concise summary (max 10 lines) of what was done.
