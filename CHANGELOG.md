# CHANGELOG.md

Project decision and progress log. Update this file on every commit.

## Entry Template

```
## YYYY-MM-DD - <short commit title>

- Summary:
  - <what changed>
- Decisions:
  - <important decision and why>
- Mistakes/Fixes:
  - <mistake and fix>
  - OR: none this commit
- Lessons Learned:
  - <what to repeat/avoid next time>
```

## 2026-02-17 - Task 11: Frontend foundation completion and tests

- Summary:
  - Added frontend foundation modules: `providers/Providers`, UI primitives (`Button`, `Input`, `Toast`), `Header`, API client, socket client, and class utility `cn`.
  - Updated app wiring so global providers wrap the app and the landing page includes real task-oriented UI with header/sign-in flow.
  - Updated dashboard behavior to redirect unauthenticated users to `/signin`.
  - Added frontend tests for `apiClient`, `cn`, `Button`, and `Header` plus Vitest alias/JSX config for stable test resolution.
- Decisions:
  - Configured Vitest with `@` alias and automatic JSX runtime to align test runtime behavior with app source imports.
- Mistakes/Fixes:
  - Initial new files included duplicate blocks from prior state; rebuilt affected files cleanly and fixed test/runtime alias issues.
- Lessons Learned:
  - Keeping test runtime module resolution aligned with Next.js path aliases prevents false negatives in frontend CI.

## 2026-02-17 - Task 10: WebSocket server setup with auth and lifecycle tests

- Summary:
  - Added Socket.IO server modules (`socket/index`, `socket/auth`, `socket/connection`, `socket/types`) with CORS and heartbeat configuration.
  - Updated server startup to create an HTTP server, attach Socket.IO, and preserve startup DB/Redis checks.
  - Added WebSocket auth and connection lifecycle tests (`socket-auth.test.ts`, `socket-connection.test.ts`).
  - Added Task 10 dependencies to server package (`socket.io`, `@socket.io/redis-adapter`, `socket.io-client`).
- Decisions:
  - Disabled Redis adapter setup in `NODE_ENV=test` to keep automated tests deterministic while still configuring Redis adapter for runtime environments.
- Mistakes/Fixes:
  - Initial file additions included duplicated blocks in socket files/tests; files were rebuilt cleanly before final verification.
- Lessons Learned:
  - For Socket.IO testability, separating auth/connection concerns into small modules enables both unit and integration coverage.

## 2026-02-17 - Task 9 CI dependency fix (zod, express-rate-limit)

- Summary:
  - Added missing server dependencies required by Task 9 runtime files: `zod` and `express-rate-limit`.
  - Updated lockfile to ensure CI resolves validation and rate-limit imports during type-check.
- Decisions:
  - Kept dependency additions scoped to `apps/server` to avoid unrelated workspace churn.
- Mistakes/Fixes:
  - CI failed for Task 9 with missing module errors; fixed by adding dependencies via pnpm in the server package.
- Lessons Learned:
  - Local success can mask missing dependency declarations when packages exist transitively; CI type-check is the definitive dependency gate.

## 2026-02-17 - Task 9: API Foundation runtime wiring and tests

- Summary:
  - Added Task 9 middleware and route foundation files (`errorHandler`, `rateLimit`, `validate`, `routes/index`, `boards`, `objects`, validator schemas).
  - Wired `/api` middleware stack in `app.ts` with rate limiting, route mounting, and global error handler.
  - Added unit/integration coverage for validators, error formatting, rate limiting, and middleware stack behavior.
- Decisions:
  - Kept board/object endpoints as stub handlers for this task while fully enforcing validation/auth/error contracts.
- Mistakes/Fixes:
  - Initial branch state had duplicated blocks in newly-added files and tests; rebuilt affected files cleanly and re-ran full checks.
- Lessons Learned:
  - For foundation tasks, acceptance confidence improves when middleware behavior is proven with focused tests, not just file presence.

## 2026-02-17 - Task 5: Startup DB/Redis connectivity verification

- Summary:
  - Added explicit startup connectivity checks for PostgreSQL and Redis before the server begins listening.
  - Added runtime success logs: "Connected to PostgreSQL" and "Connected to Redis" to satisfy Task 5 verification evidence.
- Decisions:
  - Fail fast on startup if either dependency is unavailable to avoid partial service boot with hidden runtime failures.
- Mistakes/Fixes:
  - none this commit
- Lessons Learned:
  - Verifiable startup health criteria are easier to enforce when connectivity checks are part of the boot sequence, not implicit side effects.

## 2026-02-17 - CI: add prisma generate before type-check

- Summary:
  - Added `prisma generate` step to CI before type-check so @prisma/client exports PrismaClient.
- Mistakes/Fixes:
  - CI type-check failed with "Module '@prisma/client' has no exported member 'PrismaClient'" because client was not generated before tsc.
- Lessons Learned:
  - prisma migrate deploy does not run prisma generate; type-check needs the generated client.

## 2026-02-17 - Non-negotiable per-task workflow, .dockerignore, Dockerfile fix for Render

- Summary:
  - Added per-task workflow to AGENTS.md §0 Non-negotiables: create PR → run checks → merge; on deployment failure, find root cause, document in CHANGELOG, fix.
  - Added .dockerignore to reduce Docker build context (node_modules, .next, e2e, etc.) for faster Render deploys.
  - Fixed Dockerfile: COPY . . was overwriting node_modules created by pnpm install; reordered to copy source first, then install.
  - Added deployment-failure troubleshooting to Infra/DevOps agent rules.
- Decisions:
  - .dockerignore mirrors .gitignore plus .git, e2e, *.md (except README) to keep build context small.
- Mistakes/Fixes:
  - Docker build failed with "Cannot find module prisma/build/index.js": COPY . . ran after pnpm install and overwrote apps/server, removing node_modules. Fix: copy source before install.
- Lessons Learned:
  - Render Docker builds use repo root as context; without .dockerignore, node_modules causes huge context. COPY order matters when .dockerignore excludes node_modules.

## 2026-02-17 - Enforce single author, strip Co-authored-by

- Summary:
  - Added .git/hooks/prepare-commit-msg to strip Co-authored-by trailers from commit messages.
  - Strengthened AGENTS.md: single author only, never add Co-authored-by.
- Decisions:
  - Hook runs on every commit; perl one-liner removes Co-authored-by lines case-insensitively.
- Mistakes/Fixes:
  - none this commit
- Lessons Learned:
  - Cursor may add Co-authored-by despite settings; hook provides a safety net.

## 2026-02-17 - Task 11: Frontend Foundation

- Summary:
  - Added lib/api/client.ts, lib/socket/client.ts, lib/utils/cn.ts; Button, Input, Toast, Header; Providers (Auth + Toast).
  - Landing page with Header and sign in; dashboard redirects to signin when unauthenticated.
- Decisions:
  - Vitest esbuild jsx: "automatic" for React 18; path alias @ for tests.
- Mistakes/Fixes:
  - React not defined in Vitest: added esbuild jsx automatic; Input empty interface → type.
- Lessons Learned:
  - Next.js uses automatic JSX; Vitest defaults to classic; align with esbuild config.

## 2026-02-17 - Task 10: WebSocket Server Setup

- Summary:
  - Socket.io server attached to Express HTTP server; CORS, Redis adapter (ioredis), auth middleware.
  - Connection/disconnect logging; ping/pong via Socket.IO defaults (25s/20s).
- Decisions:
  - Auth via handshake.auth.token or Authorization header; JWT validation same as REST.
- Mistakes/Fixes:
  - Vitest afterAll uses async/Promise, not done callback; fixed socket-connection test.
- Lessons Learned:
  - @socket.io/redis-adapter works with ioredis; use redis.duplicate() for sub client.

## 2026-02-17 - Task 9: API Foundation & Middleware

- Summary:
  - Added rate limiting (express-rate-limit), error handler, Zod validation middleware.
  - Created lib/validators/board.ts and object.ts; routes/boards.ts and objects.ts (stub structure).
  - Validation runs before auth to avoid unnecessary auth overhead; error handler returns consistent JSON.
- Decisions:
  - Rate limit: 100 req/15min per IP; validate-then-auth order per task edge cases.
- Mistakes/Fixes:
  - Fixed Router type inference (express.Router) for portable build; removed unused test imports.
- Lessons Learned:
  - express-rate-limit v7 uses different API; use direct import for test-specific config.

## 2026-02-17 - Task delegation: branch/PR templates and guardrails

- Summary:
  - Added `.github/PULL_REQUEST_TEMPLATE.md` with acceptance-criteria checklist and verification steps.
  - Added AGENTS.md §2.5 Task delegation: branch naming (`task-<n>-<slug>`), PR title (`Task <n>: <title>`), commit author policy.
- Decisions:
  - PR template lives in `.github/` for GitHub auto-fill; AGENTS.md documents naming for human/AI agents.
- Mistakes/Fixes:
  - none this commit
- Lessons Learned:
  - Explicit naming guardrails reduce drift when multiple agents work in parallel.

## 2026-02-17 - Task 8: Authentication Implementation

- Summary:
  - NextAuth.js with Google OAuth, JWT session strategy, user create/update on first login.
  - SignInButton, AuthProvider, signin page, dashboard page with session check.
  - Backend auth middleware validates Bearer token (apiToken from session); session helpers and anon session endpoint (Redis).
  - AGENTS.md: commits/PRs must be authored under repo owner identity.
- Decisions:
  - JWT strategy for NextAuth (no DB adapter); session callback adds apiToken (HS256) for backend API calls.
  - Anonymous session stored in Redis (session:anon:{id}) with 24h TTL.
- Mistakes/Fixes:
  - ioredis v5 ESM + TypeScript nodenext "not constructable" workaround: use require().
- Lessons Learned:
  - Cross-origin: frontend (Vercel) and backend (Render) require explicit token in Authorization header.

## 2026-02-17 - Task 7: Database Schema & Prisma Setup

- Summary:
  - Added Prisma ORM with PostgreSQL schema (Users, Boards, Objects, Sessions) matching ARCHITECTURE.md.
  - Created Prisma client singleton in `apps/server/src/lib/prisma.ts`.
  - Added initial migration, seed script, and db:migrate/db:studio scripts.
  - CI now runs Postgres service and `prisma migrate deploy` before tests; database integration test runs when DATABASE_URL is set.
  - Dockerfile CMD runs migrations before starting the server for Render deploy.
- Decisions:
  - Used `prisma migrate diff` to generate initial migration without requiring local DB for commit.
  - Prisma client singleton prevents multiple instances in dev (hot reload) and enables connection pooling in production.
- Mistakes/Fixes:
  - none this commit
- Lessons Learned:
  - Prisma 6 deprecates `package.json#prisma` in favor of `prisma.config.ts`; migration can be done later.

## 2026-02-17 - Config files to TypeScript for consistency

- Summary:
  - Converted next.config.js, tailwind.config.js, postcss.config.js to .ts equivalents.
  - Fixed server package.json trailing comma (JSON parse error).
  - Added explicit Express type annotation to server app.ts for portable build.
- Decisions:
  - Use .ts for all config files in apps/web for consistency with TypeScript codebase.
- Mistakes/Fixes:
  - none this commit
- Lessons Learned:
  - Next.js 15, Tailwind, and PostCSS all support TypeScript config natively.

## 2026-02-17 - Docs alignment baseline

- Summary:
  - Aligned architecture/spec/tasks on API ownership and auth model.
  - Standardized socket conflict-resolution fields for object updates.
  - Added changelog process requirements across project docs.
- Decisions:
  - `ARCHITECTURE.md` is the canonical contract source for REST and socket payloads.
  - MVP backend auth remains session-cookie based (no bearer-token requirement).
- Mistakes/Fixes:
  - Mistake: docs previously mixed Next.js and Express ownership for board/object REST APIs.
  - Fix: moved board/object REST ownership consistently to `apps/server`.
- Lessons Learned:
  - Keep one canonical contract source and make all planning/spec docs mirror it.
## 2026-02-17 - Phase A foundation implementation (Tasks 2-6)

- Summary:
  - Added CI pipeline at `.github/workflows/ci.yml` with lint, type-check, build, and unit test jobs on push/PR.
  - Added deployment scaffolding for Vercel (`apps/web/vercel.json`) and Render (`apps/server/Dockerfile`, `apps/server/render.yaml`).
  - Added test infrastructure: Vitest configs/tests in web+server and Playwright E2E package with an example passing test.
  - Added workspace and package-script alignment so `pnpm turbo lint`, `pnpm turbo type-check`, `pnpm turbo build`, `pnpm turbo test`, and `pnpm turbo test:e2e` succeed.
- Decisions:
  - Kept config files in TypeScript (`next.config.ts`, `tailwind.config.ts`, `postcss.config.ts`) for consistency with the codebase.
  - Used a reusable composite GitHub Action (`.github/actions/setup/action.yml`) for Node/pnpm setup and dependency caching.
- Mistakes/Fixes:
  - Mistake: initial unit tests required React runtime imports in this Vitest setup.
  - Fix: added React import in `Placeholder.tsx` and corrected test file extensions/types.
- Lessons Learned:
  - Playwright browser binaries must be explicitly installed before first `test:e2e` run in fresh environments.

