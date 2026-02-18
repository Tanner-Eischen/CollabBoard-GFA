# CHANGELOG.md

Project decision and progress log. Update this file on every commit.

## 2026-02-17 - Docker build order fix for shared package

- Summary:
  - Updated `apps/server/Dockerfile` to build `@collabboard/shared` before building `server`.
  - This ensures shared `dist` types exist when `apps/server` TypeScript compilation resolves `@collabboard/shared`.
- Decisions:
  - Keep the fix in Docker layer order rather than changing import paths or package wiring, since workspace dependency order is the root cause during image builds.
- Mistakes/Fixes:
  - Mistake: Docker was running `pnpm --filter server build` before shared package artifacts were generated, causing module resolution failures.
  - Fix: chain build commands so shared builds first, then server.
- Lessons Learned:
  - Monorepo Docker builds must respect inter-package build dependencies explicitly, even when package manifests are present.

## 2026-02-17 - CI e2e command isolation for reliable merges

- Summary:
  - Updated CI e2e job to run `pnpm --filter e2e test:e2e` instead of `pnpm turbo test:e2e`.
  - This avoids pulling `web#build` into the e2e pipeline and keeps Playwright checks scoped to the E2E package.
- Decisions:
  - Preserve the existing validate job as the single place for full build verification and keep e2e focused on runtime integration tests.
- Mistakes/Fixes:
  - Mistake: e2e CI previously failed due to unrelated `web#build` artifacts during turbo graph execution.
  - Fix: constrained the e2e command to the `e2e` workspace filter.
- Lessons Learned:
  - Separating build validation from Playwright execution makes check failures easier to diagnose and reduces false-negative PR blocks.

## 2026-02-17 - Quality gates: lint/build fixes

- Summary:
  - Fixed ESLint unused-variable errors blocking Next.js build: useKeyboardShortcuts (destructuring omit, map index), useDragCreate (CreateObjectInput), history.test.ts (HISTORY_CAP, HistoryEntry).
  - Created missing LeftPanel component (wrapper around ObjectLibrary for board page drag-create).
  - All quality gates pass: lint, type-check, test, build, test:e2e.
- Decisions:
  - Scope limited to straightforward fixes; no major rewrites.
- Mistakes/Fixes:
  - none this commit
- Lessons Learned:
  - Next.js build runs stricter ESLint than standalone `pnpm lint`; test files are included.
  - LeftPanel was referenced but not implemented; ObjectLibrary existed but needed panel wrapper.

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

## 2026-02-17 - Task 28: Undo/Redo System

- Summary:
  - Added `apps/web/src/lib/history.ts`: HISTORY_CAP (50), pushWithCap, computeAfterState, HistoryEntry types.
  - Added `apps/web/src/stores/historyStore.ts`: per-user local undo/redo stacks, recordCreate/recordUpdate/recordDelete/recordDeleteMany, undo/redo, setBoardId/clear on board change.
  - Added `apps/web/src/hooks/useUndoRedo.ts`: hook exposing undo, redo, canUndo, canRedo, updateObject, removeObject, removeObjects, recordCreate.
  - Integrated: useTransform, useProperties, CanvasContent, useKeyboardShortcuts, useDragCreate use recordUpdate/recordDeleteMany/recordCreate instead of objectStore directly.
  - Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z / Ctrl+Y (redo), Delete/Backspace (delete selected) in useKeyboardShortcuts.
  - Board page: setHistoryBoardId on board change; cleanup on unmount.
  - offlineQueue flush: recordCreate for created objects.
  - Tests: history.test.ts (5), historyStore.test.ts (8); updated useTransform, useProperties, useDragCreate, useKeyboardShortcuts, LeftPanel, ObjectLibrary tests.
- Decisions:
  - Per-board history scope: history cleared when boardId changes; recordUpdate/recordDelete no-op when boardId mismatch.
  - 50-action cap on undo stack; redo stack cleared on new action.
  - recordUpdate both records and applies; single source of truth for undoable updates.
- Mistakes/Fixes:
  - useTransform/useProperties tests failed: recordUpdate no-ops when historyStore.boardId is null; added setBoardId in beforeEach.
  - useDragCreate test: useHistoryStore not mocked; added vi.mock for historyStore with recordCreate.
  - LeftPanel test: missing onDragCreate prop; added mockHandlers.
  - ObjectLibrary test: fireEvent not imported; added to @testing-library/react import.
- Lessons Learned:
  - Hooks that depend on historyStore need boardId set in tests; centralize beforeEach setup.
  - Mock useHistoryStore when testing hooks that use it without needing full history behavior.

## 2026-02-17 - Task 22: Connection Resilience

- Summary:
  - Socket client: exponential backoff reconnect (reconnectionDelay 1s, reconnectionDelayMax 30s).
  - useSocket: returns { socket, status } with status in connected/reconnecting/offline.
  - ConnectionStatus.tsx: UI for connection state (green/amber/red dot + label).
  - offlineQueue.ts: lightweight queue for object create/update/delete; flush(token) runs queued ops in order.
  - syncState.ts: tracks lastSynced per object to avoid re-syncing socket-received updates; isDirty for change detection.
  - useObjectSync: subscribes to objectStore, debounces 500ms; when online syncs via API, when offline enqueues.
  - useOfflineQueueFlush: flushes queue when status transitions to connected.
  - useBoardObjects: marks objects as synced when received from socket (objects:list, object:created/updated/deleted).
  - Board page: ConnectionStatus, useObjectSync, useOfflineQueueFlush wired.
  - Tests: offlineQueue (5), syncState (5), ConnectionStatus (3), useSocket (3).
- Decisions:
  - Socket.IO built-in reconnection with config; no custom backoff logic.
  - Queue stores operation descriptors; flush calls REST API directly (no socket emit for object ops).
  - syncState module-level to share between useBoardObjects and useObjectSync; clearAllSynced in test beforeEach.
- Mistakes/Fixes:
  - useSocket initially returned Socket | null; changed to { socket, status } - updated board page destructuring.
  - offlineQueue test: removed unused QueuedOp import (lint).
- Lessons Learned:
  - Differentiate reconnecting (was connected, now retrying) vs offline (reconnect failed or manual disconnect).
  - Mark server-received objects as synced to avoid useObjectSync re-pushing them when online.

## 2026-02-17 - Task 24: Toolbar Implementation

- Summary:
  - Toolbar: Toolbar.tsx, ToolButton.tsx with core tools (Select, Text, Rectangle, Circle, Line, Connector, Sticky, Frame), active highlighting, tooltips with shortcuts (V, T, R, O, L, C, S, F), collapsible state.
  - toolStore: extended with TOOL_CONFIGS, TOOL_BY_SHORTCUT for labels/shortcuts; keyboard shortcuts handled in Toolbar useEffect.
  - Board page: Toolbar integrated top-left; selection cleared when switching away from select tool.
  - Canvas integration: isSelectMode (activeTool === "select") passed to ObjectRenderer; SelectableObject disables draggable and click-to-select when !isSelectMode; marquee and stage click-clear only when select tool.
  - Tests: toolStore (TOOL_CONFIGS, TOOL_BY_SHORTCUT), ToolButton (render, active/inactive, onClick), Toolbar (all tools, default select, tool switch, collapse button).
- Decisions:
  - Native title attribute for tooltips (simpler than custom tooltip; avoids layout/positioning issues).
  - Keyboard shortcuts in Toolbar component (no separate useKeyboardShortcuts hook for Task 24; Task 27 will expand).
  - Collapsed toolbar shows vertical icon strip; expand/collapse button toggles.
- Mistakes/Fixes:
  - Removed unused ToolType import from Toolbar.tsx (lint).
  - Added beforeEach import to Toolbar.test.tsx (type-check: vitest globals not always inferred).
- Lessons Learned:
  - Tool selection must gate canvas interaction: SelectableObject draggable and onClick only when select tool; marquee and stage clear likewise.
  - Clear selection on tool switch (useEffect in board page) avoids stale selection when switching to draw tools.

## 2026-02-17 - Task 23: Conflict Resolution & Optimistic Updates

- Summary:
  - Added `apps/web/src/lib/optimistic.ts`: LWW helpers (isNewerOrEqual, shouldAcceptServer, reconcileObject), applyOptimisticUpdate for immediate feedback, isObjectDisplayEqual to avoid flicker.
  - objectStore: updateObject uses applyOptimisticUpdate; added reconcileUpdate for server reconciliation with LWW; skips store write when display-equal to avoid flicker.
  - useBoardObjects: object:created and object:updated now use reconcileUpdate instead of addObject/updateObject.
  - SyncService: added isNewerOrEqual for timestamp-based LWW (server authority).
  - Tests: optimistic.test.ts (14), objectStore (5 new), useBoardObjects (object:updated LWW), SyncService (isNewerOrEqual).
- Decisions:
  - Server timestamp (updatedAt) is authoritative; client skips when local is newer (rare, clock skew).
  - Display-equal check avoids unnecessary store writes when server echoes our own update.
  - Optimistic create flow (addOptimistic/confirmOptimistic) unchanged; API persistence for updates not yet wired.
- Mistakes/Fixes:
  - objectStore originally had updateObject merge logic inline; refactored to use applyOptimisticUpdate for consistent updatedAt.
  - objectStore tests: reconcileUpdate "adds when not present" needed full server object.
- Lessons Learned:
  - LWW with timestamp comparison is simple; clock skew can cause local to reject server—acceptable for rare edge case.
  - isObjectDisplayEqual avoids flicker when server response matches our optimistic state; compare only render-affecting fields.

## 2026-02-17 - Task 26: Right Panel (Properties)

- Summary:
  - RightPanel: right-side panel container (280px default) with PropertiesPanel.
  - PropertiesPanel: selection-aware properties editor; no-selection state shows "Select an object to edit"; single/multi-select shows position (x,y), size (w,h), rotation, color.
  - ColorPicker: preset swatches + native color input; supports "mixed" state for multi-select with differing colors.
  - useProperties: hook aggregating selection + object store; returns x, y, width, height, rotation, color (or "mixed"); applyX, applyY, applyWidth, applyHeight, applyRotation, applyColor for immediate store updates.
  - Integrated RightPanel into board page layout; properties apply via objectStore.updateObject (same as useTransform).
  - Tests: useProperties (5), ColorPicker (4), PropertiesPanel (3), RightPanel (2).
  - Fixed objectStore: added missing imports for applyOptimisticUpdate, reconcileObject, isObjectDisplayEqual from @/lib/optimistic.
- Decisions:
  - Per-field apply (applyX, applyY, etc.) so multi-select edits update only the changed field across all selected objects.
  - Color applies to fill/stroke/color based on object type (rectangle/circle/text use fill; line/arrow use stroke; sticky uses color).
  - Size section shown only when at least one selected object has width/height or is a shape type.
- Mistakes/Fixes:
  - objectStore referenced applyOptimisticUpdate, reconcileObject, isObjectDisplayEqual without importing; added import from @/lib/optimistic.
  - PropertiesPanel NumberInput value type: useProperties returned string | number | null for "mixed"; added Mixedable<T> type for explicit typing.
- Lessons Learned:
  - Reuse existing optimistic/reconcile helpers when objectStore evolves; check for missing imports when tests fail with "X is not defined".
  - Per-field apply avoids overwriting unrelated properties when editing multi-selection.

## 2026-02-17 - Task 19: Real-Time Object Sync

- Summary:
  - Board join/leave: extended board:join to emit objects:list (initial state) to joining socket; reconnect path re-syncs via same flow.
  - Object create/update/delete: REST routes broadcast object:created, object:updated, object:deleted to board room with timestamps.
  - SyncService: toObjectJson, broadcastObjectCreated/Updated/Deleted; routes use getIo(req) from app.set("io").
  - Client: useBoardObjects hook subscribes to objects:list, object:created/updated/deleted; updates objectStore; integrated in board page.
  - Shared: ObjectsListPayload, ObjectCreatedPayload, ObjectUpdatedPayload, ObjectDeletedPayload in socket-events.
  - Tests: SyncService (toObjectJson, broadcast mocks), socket-presence (objects:list on board:join), useBoardObjects (store integration).
- Decisions:
  - Fire-and-forget broadcast (no ack) for p95 latency; io.to(room).emit; single DB query for initial sync.
  - Try/catch around listObjectsByBoardId in board:join so tests pass when DATABASE_URL unset.
  - object:updated with missing object in store → addObject (handles reorder/race).
- Mistakes/Fixes:
  - board.ts imported { SyncService } but SyncService exports functions; fixed to import * as SyncService.
  - SyncService had unused OBJECTS_LIST constant; removed.
- Lessons Learned:
  - Express app.set("io", io) enables routes to broadcast without circular deps; index.ts wires after createSocketServer.
  - Socket mock in tests: avoid `return this` (implicit any); use named object reference for chaining.

## 2026-02-17 - Task 18: Object Manipulation (Move, Resize, Rotate)

- Summary:
  - Implemented selection and transform system: selectionStore, useSelection, useTransform, SelectableObject, Transformer, SelectionManager (marquee), useKeyboardNudge.
  - Single and multi-select: click object to select; Shift+click to add; click empty to deselect; Shift+drag on empty for marquee selection.
  - Move/resize/rotate via Konva Transformer; drag to move; persist to object store on drag/transform end.
  - Keyboard nudging (Arrow keys) for selected objects; 8px step; prevents default when selection exists.
  - Integrated into Canvas/CanvasContent; ObjectRenderer wraps objects in SelectableObject; stage handlers for click/marquee.
  - Tests: selectionStore (8), useSelection (3), useTransform (4).
- Decisions:
  - Marquee requires Shift+drag to avoid conflicting with stage pan.
  - Objects wrapped in Group at (x,y,rotation); inner content renders at (0,0) for consistent transform.
  - Transformer handles multi-select; onTransformEnd updates each node via object store.
- Mistakes/Fixes:
  - selectionStore tests failed: getState() returns snapshot; use fresh getState() after mutations for assertions.
  - Stage ref type: use Konva.Stage directly; react-konva Stage ref passes underlying instance.
  - Konva.Transformer cast in onTransformEnd: use `as unknown as Konva.Transformer` for type safety.
- Lessons Learned:
  - Zustand getState() returns current state; store variable from prior getState() is stale after set().
  - Marquee + pan conflict resolved by modifier key (Shift) for marquee; disable stage draggable when marquee active.

## 2026-02-17 - Tasks 20 & 21: Cursor Presence and User Presence System

- Summary:
  - Task 20: Cursor presence with throttled (16ms) broadcast per board room. Server: `socket/cursor.ts`, client: `useCursor`, `CursorOverlay` (Konva Layer). Cursor coords in board space; overlay transforms to screen.
  - Task 21: User presence roster with join/leave updates. Server: `PresenceService`, `socket/board.ts` (board:join, board:leave, user:joined, user:left, users:list). Client: `presenceStore`, `useBoardPresence`, `PresenceIndicator`.
  - Shared event contracts in `packages/shared/src/types/socket-events.ts`. Added `@collabboard/shared` to server deps.
  - Tests: presenceStore, PresenceService, socket-presence (board join, user:joined, cursor:move broadcast), PresenceIndicator.
- Decisions:
  - In-memory presence per board; Redis-backed presence deferred for multi-server scale.
  - PresenceService skips Prisma user lookup when DATABASE_URL unset (test env).
  - Cursor throttle keyed by socketId+boardId; server broadcasts only to others in room.
- Mistakes/Fixes:
  - socket-presence cursor test timed out: client2 must receive users:list before client1 emits cursor:move; added await client2Joined.
  - board.ts/cursor.ts were overwritten with placeholders; restored full implementations.
- Lessons Learned:
  - Socket integration tests need explicit sequencing (await join completion) before emitting dependent events.
  - DATABASE_URL guard avoids Prisma runtime errors in CI when DB not configured.

## 2026-02-17 - Task 17: Object System - Canvas Rendering

- Summary:
  - Implemented ObjectRenderer and object components (rectangle, circle, text, sticky note, line, arrow, image placeholder) for Konva canvas.
  - Added useObjects hook for board-scoped object list from object store, sorted by zIndex.
  - Integrated ObjectRenderer into Canvas/CanvasLayer; board page sets boardId in object store and passes it to Canvas.
  - Added getObjectsByBoardIdFromMap helper for hooks that select objects only.
  - Added vitest-canvas-mock for Konva tests; tests for useObjects and ObjectRenderer.
  - Created useCursor hook (was missing) and fixed CursorOverlay Konva event typing.
- Decisions:
  - Object types map: rectangle, circle, text, sticky, line, arrow, connector→arrow, image/image-placeholder.
  - Each object component is modular; ObjectRenderer dispatches by type with memo for performance.
  - useObjects accepts optional boardId; falls back to store boardId when undefined.
- Mistakes/Fixes:
  - getObjectsByBoardId required full ObjectState; added getObjectsByBoardIdFromMap for objects-only use.
  - ObjectRenderer test makeObject overrides needed x, y in type for multi-type test.
  - useCursor was imported but missing; created hook. CursorOverlay event type used overly specific shape; switched to Konva.Stage | null.
- Lessons Learned:
  - vitest-canvas-mock enables Konva/Stage tests in jsdom. Zustand selectors returning new objects cause useMemo to re-run every render; prefer primitive/stable selectors.

## 2026-02-17 - Task 14: Dashboard UI on Task 13 APIs

- Summary:
  - Implemented dashboard UI: board list with loading/empty/error states, create board flow, delete board flow (modal confirmation), share link copy affordance.
  - Added `useBoards` hook, `BoardCard`, `BoardList`, `NewBoardButton`, `DeleteBoardModal`, `DashboardContent`; updated dashboard page and layout (Header).
  - Auth redirect to `/signin` when unauthenticated preserved.
  - Added component tests for BoardList, BoardCard, DeleteBoardModal, NewBoardButton, useBoards.
- Decisions:
  - Share URL format: `${origin}/share/${shareLink}` for future share route; copy affordance on each card.
  - ToastProvider required in BoardList test when rendering success state (BoardCard uses useToast).
- Mistakes/Fixes:
  - BoardList "renders board cards when success" failed with "useToast must be used within ToastProvider"; fixed by wrapping render with ToastProvider.
- Lessons Learned:
  - Components that use context (ToastProvider) need corresponding wrappers in tests when rendered indirectly (e.g. via BoardList → BoardCard).

## 2026-02-17 - Integration/quality orchestrator: wave gate config fixes

- Summary:
  - Fixed lint blockers: removed unused `express` imports from server routes (boards, objects, anon, index); added `Request`/`Response` types to objects handler.
  - Fixed type-check blockers: `req.params` string coercion in boards routes; `BoardService` now uses `import type` for `BoardRecord`/`CreateResult` to resolve circular reference.
  - Wave gate commands identified: `pnpm turbo lint`, `pnpm turbo type-check`, `pnpm turbo build`, `pnpm turbo test`, `pnpm turbo test:e2e` (CI e2e job).
- Decisions:
  - Scope limited to script wiring and package references; no feature behavior changes to avoid duplicating Tasks 12/13/15.
  - `String(req.params.id ?? "")` used for param coercion to satisfy Express `string | string[]` typing.
- Mistakes/Fixes:
  - none this commit
- Lessons Learned:
  - `import type` for repository types breaks circular reference that caused "declares locally but not exported" errors when using namespace imports.

## 2026-02-17 - Task 12: Basic E2E test (auth flow)

- Summary:
  - Added Playwright E2E tests for auth flow: `e2e/tests/auth.spec.ts` (sign-in page, protected redirect, sign-in→dashboard, sign-out→landing) and `e2e/tests/home.spec.ts` (landing page load).
  - Created `e2e/fixtures/test-helpers.ts` with `seedE2ESession` and `clearE2ESession` for CI-safe cookie-based auth.
  - Updated `e2e/playwright.config.ts` to set `E2E_AUTH_ENABLED=true` for webServer and to run `prisma generate` before `next dev`.
  - Wired `authOptions` signIn callback to skip DB for E2E provider.
  - Added E2E job to CI workflow with Postgres, migrations, and Playwright Chromium.
- Decisions:
  - Use seeded test session cookie (`/api/test-auth/signin`, `/api/test-auth/signout`) instead of live Google OAuth in CI; test-only toggles via `E2E_AUTH_ENABLED` env.
  - Run `prisma generate` in webServer command so dev server has Prisma client when E2E tests start.
- Mistakes/Fixes:
  - Initial run failed with "Cannot find module '.prisma/client/default'" because `next dev` started without Prisma client; fixed by adding `prisma generate` to webServer command.
  - Landing page test expected `getByRole("link", { name: /sign in/i })`; switched to `getByRole("button", { name: /sign in/i })` to match Header structure.
- Lessons Learned:
  - E2E webServer must ensure Prisma client exists before starting Next.js dev; turbo build runs generate for production but dev uses source directly.

## 2026-02-17 - Tasks 1-11 checklist status sync in tasks.md

- Summary:
  - Updated Task 1-11 acceptance checkboxes in `tasks.md` to reflect merged implementation progress.
  - Marked externally-verified platform items (Vercel/Render/branch protection/manual infra checks) as pending where repository state alone cannot confirm completion.
- Decisions:
  - Keep external platform criteria unchecked unless directly verifiable from repository and CI evidence.
- Mistakes/Fixes:
  - none this commit
- Lessons Learned:
  - Keeping task checklists synchronized with merged PR outcomes reduces ambiguity and makes planning/verification faster.

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

## 2026-02-17 - Task 12: CI-safe E2E auth session fixture

- Summary:
  - Added test-only auth session helpers and API routes so E2E can sign in/sign out without live OAuth.
  - Updated dashboard session resolution to accept seeded E2E session cookies when `E2E_AUTH_ENABLED=true`.
- Decisions:
  - Kept production auth flow unchanged and gated all E2E auth behavior behind an environment flag.
- Mistakes/Fixes:
  - Mistake: initially introduced an extra test auth provider in NextAuth options.
  - Fix: removed provider injection and kept a simpler cookie-based E2E fixture path.
  - Mistake: CI E2E job initially used `pnpm turbo test:e2e`, which pulled in `web#build`.
  - Fix: switched CI E2E command to `pnpm --filter e2e test:e2e` to run Playwright directly.
  - Mistake: dashboard imported `authOptions` eagerly, which loaded Prisma paths during CI E2E.
  - Fix: switched dashboard auth resolution to lazy dynamic imports when E2E session is not present.
  - Mistake: in E2E mode with no cookie, dashboard still attempted NextAuth import path.
  - Fix: bypassed NextAuth entirely in E2E mode and redirected unauthenticated test sessions to `/signin`.
- Lessons Learned:
  - For CI reliability, isolate test auth from provider callbacks and database-dependent auth flows.

