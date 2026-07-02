# Notes

- This repository is intentionally scaffold-only.
- Keep shared validation schemas in `shared/src/schemas` when domain modeling begins.
- Keep server use cases in `server/src/services` and persistence code in `server/src/repositories`.
- Keep frontend server/client API boundaries in `web/src/lib/api` and query wrappers in `web/src/lib/query`.
- Add database tables under `server/src/db/schema` only when application features are introduced.
