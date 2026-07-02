# Community Forum

Production-ready boilerplate for a community forum monorepo.

## Stack

- pnpm Workspaces
- Node.js LTS
- TypeScript strict mode
- React 19 and Next.js App Router
- Elysia
- PostgreSQL, Drizzle ORM and Drizzle Kit
- Zod
- TanStack Query v5
- Vitest
- next-intl
- Tailwind CSS

## Getting Started

```bash
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

## Scripts

- `pnpm dev` starts the frontend and backend in development mode.
- `pnpm build` builds every workspace package.
- `pnpm typecheck` runs TypeScript checks.
- `pnpm lint` runs ESLint.
- `pnpm test` runs Vitest.
- `pnpm db:generate` creates Drizzle migrations.
- `pnpm db:migrate` applies migrations.
- `pnpm db:seed` runs the seed entrypoint.

No product pages, API endpoints, database schema, authentication, business logic, or tests have been implemented yet.
