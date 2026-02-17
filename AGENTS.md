# AGENTS.md

This repository is **CollabBoard**: a production-grade collaborative whiteboard with a Next.js 15 frontend (Vercel) and a Node.js/Express + Socket.io backend (Render), backed by PostgreSQL and Redis. The architecture, spec, and task plan are defined in:
- `ARCHITECTURE.md` (system design, data flows, folder structure, API and socket contracts)
- `spec.md` (user stories, success metrics, non-functional requirements)
- `tasks.md` (ordered implementation plan with dependencies and acceptance criteria)

Use this file as the operating manual for human and AI agents working in the repo.

---

## 0) Non-negotiables (project invariants)

**Performance targets**
- 60 FPS during pan/zoom/object manipulation.
- Object sync latency <100ms (p95), cursor sync latency <50ms (p95).

**Correctness targets**
- Board state persists when everyone leaves.
- Reconnect restores state and syncs queued offline operations.
- Conflict strategy for MVP: last-write-wins (LWW), server timestamp authoritative.

**Security baseline**
- Auth via OAuth (Google) for creators; anonymous collaborator sessions supported.
- Validate all inputs (Zod); rate limit; enforce board access control by owner or share link.
- WebSocket connections must be authenticated/authorized the same way as REST.

---

## 1) Repo map (where things go)

Monorepo layout (canonical source: `ARCHITECTURE.md`):
- `apps/web/`: Next.js 15 (App Router), Konva canvas, Zustand stores, socket client
- `apps/server/`: Express REST API + Socket.io server, Prisma, Redis
- `packages/shared/`: shared types/constants/utils across web/server

Keep changes localized to the correct package. Prefer shared types in `packages/shared` when they cross boundaries (API, socket events, domain models).

---

## 2) Working style (how to make changes)

### 2.1 Task-driven development
Follow `tasks.md` ordering unless you have a strong reason not to.
- Each PR/change should map to a single task or a clearly scoped subtask.
- Copy the relevant **acceptance criteria** into the PR description and check them off.

### 2.2 “Small, testable steps”
- Add types/contracts first, then implementation, then tests, then wiring.
- Prefer narrow PRs: one feature, one surface area, minimal incidental refactors.

### 2.3 Definition of done
A change is “done” only when:
- It meets acceptance criteria.
- It is covered by appropriate tests (unit/integration/E2E where relevant).
- It does not regress performance targets or real-time behavior.
- It updates docs if it changes contracts (REST, sockets, types, env vars).

### 2.4 Change log discipline (required each commit)
- Every commit must include an entry in `CHANGELOG.md`.
- Log notable progress, key decisions, mistakes, fixes, and lessons learned.
- If no mistakes occurred, write `Mistakes/Lessons: none this commit`.
- Keep entries factual and short so history stays easy to scan.

---

## 3) Agent roles and boundaries

This project is easiest to execute with specialized agents. If you are a single agent, adopt these hats explicitly.

### 3.1 Tech Lead / Planner Agent
**Owns:** task selection, sequencing, cross-cutting decisions, risk management  
**Inputs:** `tasks.md`, `ARCHITECTURE.md`, `spec.md`  
**Outputs:**
- A short implementation plan per task: files touched, new modules, tests, rollout steps
- Clear acceptance checklist + verification commands
- Decision log updates when deviating from specs

### 3.2 Frontend Agent (Next.js + Konva)
**Owns:** UI, canvas interactions, Zustand stores, socket client integration  
**Key modules:**
- `apps/web/src/components/canvas/*`
- `apps/web/src/stores/*`
- `apps/web/src/hooks/*`
- `apps/web/src/lib/socket/*`, `apps/web/src/lib/konva/*`
**Rules:**
- Guard 60 FPS: throttle pointer events, avoid unnecessary re-renders, memoize.
- Keep canvas logic (Konva) separate from domain state (stores/services).
- Avoid coupling UI components to backend transport; use hooks/stores as the seam.

### 3.3 Backend Agent (Express + Prisma)
**Owns:** REST API, services, repositories, validation, auth middleware  
**Key modules:**
- `apps/server/src/routes/*`
- `apps/server/src/services/*`
- `apps/server/src/repositories/*`
- `apps/server/src/middleware/*`
- `apps/server/src/lib/validators/*`
**Rules:**
- Validate all inputs at the edges (Zod in routes/middleware).
- Keep business logic in services; repositories are thin data access layers.
- Use transactions where atomicity matters (batch ops, cascading deletes).

### 3.4 Realtime Agent (Socket.io + presence/sync)
**Owns:** socket namespaces/rooms, event contracts, presence/cursor services, offline sync  
**Key modules:**
- `apps/server/src/socket/*`
- `apps/server/src/services/PresenceService.ts`, `SyncService.ts`
- `apps/web/src/lib/socket/*`, `apps/web/src/hooks/useSocket.ts`
**Rules:**
- Don’t broadcast on every micro-change unless throttled/batched.
- Include timestamps in update events; server authority for conflict resolution.
- Treat reconnect as a first-class path: resync state, reconcile optimistic ops.

### 3.5 Infra/DevOps Agent (CI/CD, deploy, env)
**Owns:** GitHub Actions, Vercel/Render config, Docker, env vars, migrations  
**Key modules:**
- `.github/workflows/*`
- `docker/*`, `apps/server/Dockerfile`, `apps/server/render.yaml`
- `.env.example`
**Rules:**
- “Deployment-first”: main stays deployable; CI must be green.
- Migrations must be compatible with Render build/deploy flow.

### 3.6 QA/Test Agent (Vitest/Playwright)
**Owns:** unit/integration/E2E coverage, test utilities, load/perf checks  
**Rules:**
- Tests should mirror the pyramid in `ARCHITECTURE.md`: lots of unit tests, fewer integration, minimal E2E focused on critical paths.
- Add multi-user E2E tests for realtime features early (object sync, cursor/presence).

---

## 4) Contracts (don’t break these casually)

### 4.1 REST endpoints
The REST surface is defined in `ARCHITECTURE.md` and `spec.md`. Maintain stable request/response shapes. If you must change a contract:
- Update shared types in `packages/shared`
- Update both client and server
- Update docs and add integration tests

### 4.2 WebSocket events
Socket event names and payloads are defined in `ARCHITECTURE.md`. Event changes require:
- Shared type updates (`packages/shared/src/types/socket-events.ts` or equivalent)
- Server handler updates + tests
- Client wiring updates + tests (prefer integration test with socket.io-client)

---

## 5) Coding conventions (make diffs predictable)

### 5.1 TypeScript
- Strict types, no `any` unless isolated and justified.
- Prefer discriminated unions for object types (`type` field).
- Keep shared domain types in `packages/shared` when used by both sides.

### 5.2 Errors and responses (backend)
- Centralize error formatting in the global error handler.
- Use explicit HTTP status codes and consistent JSON error shape.

### 5.3 State management (frontend)
- Keep Zustand stores small and focused (canvas, objects, selection, presence, tool, UI).
- Prefer immutable updates (Immer if adopted consistently).
- Optimistic operations must be reversible/reconcilable.

---

## 6) Performance and scaling notes (don’t regress)

### 6.1 Canvas rendering
- Avoid re-rendering all objects on selection changes.
- Consider “render only visible objects” once approaching 500+ objects.
- Use Konva batching and layer separation (grid vs objects vs overlays).

### 6.2 Realtime throughput
- Cursor updates: throttle to ~16ms (max 60 FPS).
- Object updates: batch within a short window when dragging/resizing.
- Use Redis for presence/cursor storage and (future) pub/sub scaling.

---

## 7) Test and verification commands (must run locally)

From repo root (adjust if scripts differ):
- Install: `pnpm install`
- Lint: `pnpm turbo lint`
- Type-check: `pnpm turbo type-check`
- Unit tests: `pnpm turbo test`
- E2E tests: `pnpm turbo test:e2e`
- Server health: `curl http://localhost:3001/health`

Add/adjust package scripts as needed, but keep these top-level commands working.

---

## 8) PR checklist template

- [ ] Scoped to one task (or clearly scoped subtask)
- [ ] Acceptance criteria copied from `tasks.md` and checked off
- [ ] Tests added/updated (unit/integration/E2E as appropriate)
- [ ] No contract drift (REST/socket/types) without updating shared types + docs
- [ ] `CHANGELOG.md` updated with progress, decisions, and lessons learned
- [ ] Verified locally with `pnpm turbo lint`, `pnpm turbo type-check`, `pnpm turbo test`
- [ ] If realtime/canvas touched: checked for obvious performance regressions

---

## 9) Known “sharp edges” to watch

- WebSocket auth: ensure parity with REST authorization (owner vs share link).
- LWW timestamps: client clocks drift; server timestamp should be authoritative.
- Multi-tab presence: dedupe or treat as separate sessions intentionally.
- Offline queue: ordering, idempotency, and reconciliation against server state.
- Connectors: re-route on object move without O(n^2) recalcs at scale.

---

## 10) When you are unsure

Prefer these sources in order:
1) `tasks.md` for what to do next and acceptance criteria  
2) `ARCHITECTURE.md` for how it should be built (modules, contracts, data flows)  
3) `spec.md` for why it matters (user stories, NFRs, success metrics)  

If you deviate, document the decision in the PR and update the relevant doc.
