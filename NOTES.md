# Overview

Community Forum is a course-scoped discussion board. Students see posts for the courses they're enrolled in, can bookmark ("save") posts for later, and moderators can see every course and remove posts. It's built as a pnpm monorepo (`web`, `server`, `shared`) with a layered Elysia/Postgres backend and a Next.js/React Query frontend.

The guiding idea was to keep the implemented surface small and correct rather than wide and shallow: course feed, saved posts (with real pagination), and moderator moderation are fully built, tested, and enforced server-side, instead of stretching to cover comments, likes, or search with half-finished plumbing. Every layer has one job — routes translate HTTP, services decide what's allowed and what happens, repositories talk to the database, and nothing skips a layer.

# Architecture Decisions

**Why a layered architecture.** With `route → service → repository → db`, there is always one obvious place to make a change. Need a new business rule? It goes in a service. Need a different query? It goes in a repository. This also means a service can be tested without a database and a route can be tested without real business logic running (`posts.service.test.ts` mocks the repository; `api.integration.test.ts` mocks the service).

**Why Repository → Service → API separation specifically.** Repositories (`server/src/repositories`) only contain Drizzle queries — no `if` statements about who's allowed to do what. Services (`server/src/services`) hold the actual decisions: whether a save is a duplicate, whether a page number needs clamping, whether a post can be deleted. Routes (`server/src/api/routes`) are thin — they authenticate, validate, call one service method, and map the result to an HTTP status. This is why `posts.routes.ts` is barely 40 lines: it isn't doing anything except wiring.

**Why React Query.** The app's data (feed, saved posts, pagination state) is server state — it can go stale, needs refetching, and multiple components need a consistent view of it. React Query gives caching, de-duplication, and background refetching for free, and `placeholderData: keepPreviousData` on the feed/saved-posts queries (`use-course-feed.ts`, `use-saved-posts.ts`) means changing pages doesn't flash the whole list to a skeleton — the old page stays visible while the new one loads.

**Why Drizzle.** Drizzle keeps the actual SQL visible instead of hiding it behind a heavy ORM abstraction — the joins, `groupBy`, and `limit`/`offset` in `posts.repository.ts` are just Drizzle's query builder, not a generated black box. Row types (`Post`, `NewPost`, …) are inferred straight from the table definitions in `server/src/db/schema`, so the TypeScript type and the database truth can't quietly drift apart.

**Why PostgreSQL.** The data is inherently relational — users, courses, enrollments, posts, and saved posts reference each other, and integrity rules (a save can't exist twice, a post can't outlive its author's foreign key constraint) are enforced by real foreign keys and a partial unique index, not by hoping the application code never has a bug.

**Why Elysia.** It's a small, fast HTTP framework with strong TypeScript inference for route handlers and a plugin model that fits how this API is composed: an auth plugin derives `user` from headers, an error-handler plugin maps thrown errors to HTTP responses, and route modules just declare method/path/handler.

**Why Next.js App Router.** Server Components are the default, so route files under `web/app` stay thin and only add `"use client"` where there's real interactivity (`FeedTemplate`, `SavedPostsTemplate`, the demo user switcher). That keeps the initial HTML small and makes it obvious, file by file, what actually needs to run in the browser.

**Why Zod validation.** Every request parameter (course/post IDs, pagination query params) is parsed with Zod before it reaches a service (`plugins/RequestValidation.ts`), so a service never has to defend against a malformed page number or a non-UUID ID — invalid input is rejected as a 400 before business logic runs. The same pattern validates `NEXT_PUBLIC_*` environment variables on the client (`web/src/config/env.ts`), so a missing env var fails fast and obviously instead of surfacing as a confusing runtime bug later.

**Why Atomic Design.** Components are organized as atoms (`Button`, `Badge`, `Avatar`), molecules (`Pagination`, `EmptyState`, `ViewToggle`), organisms (`NavSidebar`, `AppHeader`, `MobileNav`), and templates (`AppLayout`). This gives every new piece of UI an obvious home based on how reusable and how composed it is, instead of everything piling up in one `components` folder.

**Why a monorepo.** `server`, `web`, and `shared` share one TypeScript/lint/test configuration and can be built and checked together (`pnpm -r build`, `pnpm -r test`), while still being independently runnable services. `shared` exists so cross-cutting values (currently just supported locales) don't get redefined twice — it stayed small because most of this project's contracts didn't end up needing to be shared (see Trade-offs).

# Authentication

Real authentication — login, sessions, signup, JWTs — is intentionally not implemented. The assignment explicitly asked for a stubbed identity, so `authenticateRequest` (`server/src/api/plugins/AuthPlugin.ts`) reads `x-user-id` and `x-role` straight from request headers, validates them as a UUID and an enum (`student` | `moderator`), and rejects the request with 401 if either is missing or malformed. On the frontend, a small "Demo User" switcher (`DemoUserProvider`) lets you pick between three seeded identities — Alice, Bob, and a moderator — and switching just changes which `x-user-id`/`x-role` pair gets attached to the next request (`web/src/lib/api/ApiClient.ts`). There's no session, cookie, or token anywhere in the stack.

What is real is authorization. Knowing *who* is asking is stubbed; deciding *what they're allowed to do* is not. Every route that needs it calls `assertCanAccessCourse` or `assertModerator` before touching data, and those checks run against the actual role and enrollment rows in Postgres — they don't trust anything the client claims beyond the header values themselves.

# Saved Posts Design

**Soft delete.** Unsaving a post doesn't delete the row — `saved_posts.deleted_at` gets set (`saveRepo.softDelete`). The row stays in the table, just marked inactive.

**Idempotent save.** Calling save on a post that's already actively saved is a no-op: `savePost` looks for an existing row first, and if it's already active it just returns it instead of inserting a second one.

**Reactivation.** If a prior save exists but was soft-deleted, saving again doesn't insert a new row — it clears `deleted_at` and refreshes `saved_at` on the same row (`saveRepo.reactivate`). One user/post pair only ever has one row, no matter how many times it's saved and unsaved.

**Why duplicate saves are impossible.** Two layers back this up. The service checks for an existing row before deciding whether to insert, reactivate, or no-op. But the real guarantee is a partial unique index in the schema — `saved_posts_active_user_post_unique` on `(user_id, post_id) WHERE deleted_at IS NULL` — which Postgres enforces regardless of what the application code does. If a bug ever let two "create" calls race, the database would reject the second insert.

**Why bookmark counts remain correct.** Every count query (`getSaveCountForPost`, `getSaveCountsForPosts`, `countSavedPosts`) filters on `deleted_at IS NULL`. A soft-deleted save can never inflate a count, and reactivating a save doesn't double-count it because it's still the same row being toggled, not a new one being added.

# Authorization

**Students** can view the feed for courses they're enrolled in and their own saved posts. They cannot view a course they're not enrolled in (403), and they cannot delete posts.

**Moderators** bypass enrollment checks entirely — `assertCanAccessCourse` returns immediately when `user.role === "moderator"` — so a moderator can read any course's feed. Moderators are also the only role allowed to hit `DELETE /api/posts/:postId` (`assertModerator`).

**Enrollment checks** are a direct existence lookup against the `enrollments` table (`enrollmentsRepository.isUserEnrolled`), run before returning a course feed and before letting a student save a post that belongs to a course they're not in.

**Why authorization is enforced in the API/service layers, not the client.** The client only *hides* things a user isn't supposed to use — students never see a Delete button, for instance — but that's a UX convenience, not a security boundary. The actual enforcement happens on every request: a student's headers sent straight at another course's feed endpoint, or a delete request, still gets a 403 from the server, regardless of what the UI does or doesn't render. This is covered directly in `api.integration.test.ts`.

# Client State

**React Query** owns everything that comes from the server — the course feed, saved posts, and their pagination metadata. Query keys (`web/src/hooks/queries/query-keys.ts`) include both the pagination params and the acting user's auth, so paging through the feed or switching the demo user produces a distinct cache entry instead of one query silently serving the wrong page or the wrong person's data.

**Optimistic updates** make bookmarking feel instant: `markPostSaved`/`markPostUnsaved` (`hooks/mutations/cache-updates.ts`) patch the cached `hasSaved`/`savesCount` before the network request resolves. If the request fails, the previous cache snapshot is restored. These patches are scoped to the acting user's own cached queries (matched against the `auth` embedded in the query key), so an action taken as one demo user can't bleed into another demo user's cached view.

**Cache invalidation** happens on every save/unsave/delete mutation once it settles — the feed and saved-posts caches are invalidated so the UI reconciles with whatever the server actually did, even in cases the optimistic patch didn't fully account for (like pagination totals shifting after a delete).

**Why server state is separated from UI state.** Things like which view mode is selected (list/grid), whether the demo-user dropdown is open, or the current theme live in plain `useState` inside the component that owns them. They have nothing to do with the backend and don't need caching or invalidation — mixing them into React Query would blur what TanStack Query is actually responsible for keeping in sync with the server.

# Internationalization

The app ships with two locales, English and Spanish (`web/src/locales/en.json`, `es.json`), using `next-intl`. `web/src/middleware.ts` handles locale routing (prefixed only when needed), and `web/src/i18n/request.ts` loads the matching message file per request.

Every piece of UI copy — nav labels, empty states, pagination status text, delete confirmations, role names — goes through `useTranslations()` rather than being hardcoded in a component. This isn't just tidiness: it means adding a third language is a matter of adding one JSON file, not hunting through every component for string literals, and it keeps the two locale files honest — a component asking for a key that doesn't exist in a message catalog fails immediately instead of silently showing English everywhere.

# Testing

The suite is 50 tests across two workspaces, all run through Vitest.

- **Unit tests** for pure logic: `PaginationService.test.ts` and `PaginationState.test.ts` test page clamping, defaulting, and `hasNextPage`/`hasPreviousPage` math directly, with no database or HTTP involved.
- **Business logic tests**: `posts.service.test.ts` and `saved-posts.service.test.ts` mock the repository layer and assert on what the service decides — save vs. reactivate vs. no-op, pagination clamping against a real item count, save-count hydration — without touching Postgres.
- **API tests**: `api.integration.test.ts` runs the actual Elysia app with mocked service/repository dependencies injected, asserting on real HTTP responses.
- **Authorization tests** live inside that same integration suite rather than a separate file, because authorization only really means something once you can see the HTTP outcome: 401 with no auth headers, 403 for a student outside their enrolled course, 403 for a student attempting a delete, 404 for a missing post, 204 for a successful moderator delete.

# Trade-offs

These were deliberate cuts made to stay inside the assignment's time box, not things that were hard:

- **Real authentication** (login, signup, sessions, JWTs) — the assignment explicitly asked for a stubbed identity via headers instead, so that's what's implemented.
- **Comments, likes, post creation/editing, search, notifications, file uploads** — none of these exist. Building any of them "for real" (with validation, authorization, tests, and UI) would have taken time away from making the feed, saved posts, pagination, and moderation genuinely correct and well-tested. A shallow version of six features seemed worse than a solid version of three.

A few smaller, worth-naming trade-offs:

- `shared/` stayed minimal — just locale constants and a couple of generic types. Request/response shapes are hand-duplicated between `server` and `web` rather than shared through common Zod schemas, because introducing a shared contract layer for two endpoints wasn't worth the overhead in this time box.
- The `x-user-id`/`x-role` header contract is trivially spoofable by design — acceptable only because it's explicitly a stand-in for real auth, not a production mechanism.
- Optimistic cache updates cover the common cases (save/unsave/delete toggling `hasSaved` and counts) but don't recompute every derived field (like exact pagination totals) optimistically — those are corrected by the invalidation-triggered refetch instead of being modeled twice.
- `courses.repository.ts` and `users.repository.ts` exist with basic lookups but have no corresponding service — they were scaffolded early and never became necessary once course/user data only ever showed up embedded inside post and feed responses.

# What I'd Build Next

- Swap the header-based auth stub for real sessions or JWTs behind the same `AuthenticatedUser` shape that's already used everywhere, so the change would be mostly contained to `authenticateRequest`.
- Post creation and basic moderation tools (edit, pin) now that delete already exists as a pattern to extend.
- Search over posts, likely Postgres full-text search first since the schema and data are already there — no new infrastructure needed to get something working.
- Promote the request/response shapes (`Post`, `HydratedPost`, the pagination envelope) into `shared/src/schemas` as real Zod schemas so the client and server contracts can't drift apart silently.
- Repository-level integration tests against a real Postgres instance — the current suite tests services against mocked repositories, so the actual SQL (joins, the partial unique index, cascade deletes) isn't covered by an automated test yet, only verified manually during development.
- A notification badge for new activity in a student's enrolled courses — polling to start, since the pagination and query-key infrastructure already needed to support it exists.
