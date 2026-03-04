# Student Platform Docs

This folder is the internal documentation hub for maintainers and agents.

## Doc Map

### Start Here
- `docs/setup/README.md`: local setup, run commands, env vars.
- `docs/troubleshooting/README.md`: common issues and fixes.

### Frontend
- `docs/frontend/README.md`: frontend map and entry points.
- `docs/frontend/routing.md`: route flow and shell/router responsibilities.
- `docs/frontend/features.md`: feature ownership by area.
- `docs/frontend/state-and-storage.md`: local state, hooks, and storage model.

### Architecture
- `docs/architecture/README.md`: architecture references index.
- `docs/architecture/system-overview.md`: system-level architecture narrative.
- `docs/architecture/frontend-data-model.md`: canonical frontend data contracts.
- `docs/architecture/app-schema.md`: normalized DB schema.

### Memory
- `docs/memory/RECENT.md`: latest implementation updates (keep to 10 lines max per update block).

## Maintenance Rules

- Keep docs aligned with code whenever routes, features, hooks, schemas, or environment behavior changes.
- Run `npm run docs:check` before merging changes that touch shared types/contracts/storage keys.
- Add a short summary entry to `docs/memory/RECENT.md` after each meaningful code or doc update.
