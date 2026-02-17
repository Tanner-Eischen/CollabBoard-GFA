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

