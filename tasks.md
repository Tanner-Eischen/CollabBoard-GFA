# tasks.md

## Project: CollabBoard

> Ordered task list with dependencies, acceptance criteria, and verification steps.
>
> **Approach:** Deployment-First Development — CI/CD and infrastructure are set up from day one so every commit is tested and deployable.

Contract alignment note:
- `ARCHITECTURE.md` is canonical for endpoint/event contracts.
- `tasks.md` implementation details must stay aligned with `ARCHITECTURE.md` and `spec.md`.

---

## Task Overview

```
Phase A: Deployment Foundation (Tasks 1-6) ← START HERE
├── Task 1: Project Initialization & Monorepo Setup
├── Task 2: CI/CD Pipeline Setup (GitHub Actions)
├── Task 3: Frontend Deployment (Vercel)
├── Task 4: Backend Deployment (Render)
├── Task 5: Database & Redis Setup (Render Managed)
└── Task 6: Test Infrastructure Setup

Phase B: Authentication & Core (Tasks 7-12)
├── Task 7: Database Schema & Prisma Setup
├── Task 8: Authentication Implementation
├── Task 9: API Foundation & Middleware
├── Task 10: WebSocket Server Setup
├── Task 11: Frontend Foundation
└── Task 12: Basic E2E Test (Auth Flow)

Phase C: Core Board Features (Tasks 13-18)
├── Task 13: Board CRUD Operations
├── Task 14: Dashboard UI
├── Task 15: Canvas Foundation
├── Task 16: Object System - Data Layer
├── Task 17: Object System - Canvas Rendering
└── Task 18: Object Manipulation (Move, Resize, Rotate)

Phase D: Real-Time Collaboration (Tasks 19-23)
├── Task 19: Real-Time Object Sync
├── Task 20: Cursor Presence
├── Task 21: User Presence System
├── Task 22: Connection Resilience
└── Task 23: Conflict Resolution & Optimistic Updates

Phase E: UI/UX Polish (Tasks 24-28)
├── Task 24: Toolbar Implementation
├── Task 25: Left Panel (Object Library)
├── Task 26: Right Panel (Properties)
├── Task 27: Keyboard Shortcuts
└── Task 28: Undo/Redo System
```

---

## Phase A: Deployment Foundation

> **Goal:** Every commit to main automatically deploys. CI runs on every PR. Project is deployable from day one.

### Task 1: Project Initialization & Monorepo Setup

**Depends on:** None

**Repository:** `https://github.com/Tanner-Eischen/CollabCanva-GFA.git`

**Files to create:**
```
/
├── package.json (root)
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
├── .env.example
├── .prettierrc
├── .eslintrc.js
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   ├── postcss.config.js
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx
│   │       │   └── globals.css
│   │       └── components/
│   │           └── Placeholder.tsx
│   └── server/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           └── app.ts
└── packages/
    ├── shared/
    │   ├── package.json
    │   └── tsconfig.json
    └── eslint-config/
        ├── package.json
        └── index.js
```

**What:**
Initialize the monorepo structure with Turborepo, configure pnpm workspaces, set up shared TypeScript configurations, and establish development tooling (ESLint, Prettier). Create minimal "hello world" apps for frontend and backend.

**Why:**
A well-structured monorepo enables code sharing between frontend and backend, unified development experience, and efficient CI/CD pipelines. Starting with deployable placeholders ensures deployment works from the start.

**Edge cases:**
- Ensure TypeScript paths resolve correctly across packages
- Handle different Node.js versions in development
- Empty apps still build and deploy successfully

**Acceptance criteria:**
- [x] `pnpm install` completes without errors
- [x] `pnpm turbo build` runs successfully across all apps
- [x] ESLint and Prettier work in all packages
- [x] TypeScript compilation succeeds in all packages
- [x] .env.example documents all required environment variables
- [ ] Frontend shows "CollabBoard - Coming Soon" page (superseded by Task 11 landing page)
- [x] Backend health endpoint returns 200 OK
- [x] Code pushed to GitHub repository

**Verification:**
```bash
pnpm install
pnpm turbo build
pnpm turbo lint
curl http://localhost:3001/health
```

**Estimated time:** 2-3 hours

---

### Task 2: CI/CD Pipeline Setup (GitHub Actions)

**Depends on:** Task 1

**Files to create:**
```
.github/
├── workflows/
│   └── ci.yml
└── actions/
    └── setup/
        └── action.yml (optional, for reusable setup)
```

**What:**
Set up GitHub Actions workflow that runs on every push and PR: install dependencies, lint, type-check, and build. This ensures code quality before any merge.

**Why:**
CI from day one catches issues early and enforces code quality standards. No broken code makes it to main.

**Edge cases:**
- Monorepo caching for faster builds
- Different Node versions
- Failed build should block PR merge

**Acceptance criteria:**
- [x] CI workflow runs on every push to any branch
- [x] CI workflow runs on every PR
- [x] Workflow installs dependencies with pnpm
- [x] Workflow caches pnpm store for speed
- [x] Workflow runs `pnpm turbo lint`
- [x] Workflow runs `pnpm turbo type-check`
- [x] Workflow runs `pnpm turbo build`
- [ ] Failed CI blocks PR merge (branch protection)
- [x] CI badge added to README.md

**Verification:**
```bash
# Push to branch, verify CI runs in GitHub Actions
# Create PR, verify CI status appears
```

**Estimated time:** 1-2 hours

---

### Task 3: Frontend Deployment (Vercel)

**Depends on:** Task 2

**Files to create/modify:**
```
apps/web/
├── vercel.json
└── package.json (update scripts)
```

**What:**
Connect GitHub repository to Vercel. Configure automatic deployments: preview deployments for PRs, production deployment for main branch. Set up environment variables.

**Why:**
Frontend deployment from day one means you always have a live version to test and share. Preview URLs for PRs enable easy review.

**Edge cases:**
- Monorepo detection (Vercel needs to know apps/web is the root)
- Environment variables for API URL
- Build command configuration

**Acceptance criteria:**
- [x] Vercel project connected to GitHub repo
- [ ] Root directory set to `apps/web`
- [x] Build command: `cd ../.. && pnpm turbo build --filter=web`
- [ ] Production deployment triggers on push to main
- [x] Preview deployment triggers on every PR
- [ ] Environment variable `NEXT_PUBLIC_API_URL` configured
- [ ] Production URL accessible and shows landing page
- [x] Preview URL appears in PR comments

**Verification:**
```bash
# Push to main, verify deployment at production URL
# Create PR, verify preview URL in PR comments
# Visit preview URL, verify page loads
```

**Estimated time:** 1 hour

---

### Task 4: Backend Deployment (Render)

**Depends on:** Task 2

**Files to create/modify:**
```
apps/server/
├── Dockerfile
└── render.yaml
```

**What:**
Connect GitHub repository to Render. Configure Docker-based deployment with automatic deploys on push to main. Set up health check endpoint for monitoring.

**Why:**
Backend deployment from day one ensures WebSocket and API infrastructure works in production. Docker ensures consistent environments.

**Edge cases:**
- Docker build context for monorepo
- Port configuration (Render uses PORT env var)
- Health check endpoint for zero-downtime deploys

**Acceptance criteria:**
- [ ] Render web service connected to GitHub repo
- [x] Dockerfile builds successfully
- [x] Build context handles monorepo (copies root package files)
- [ ] Production deployment triggers on push to main
- [x] Health endpoint `/health` returns 200
- [ ] Backend URL accessible
- [x] Environment variables configured (placeholder for now)

**Verification:**
```bash
# Push to main, verify deployment at Render URL
curl https://<backend-url>/health
# Should return: {"status":"ok"}
```

**Estimated time:** 1-2 hours

---

### Task 5: Database & Redis Setup (Render Managed)

**Depends on:** Task 4

**Files to create/modify:**
```
apps/server/
├── .env.example (update with database URLs)
└── render.yaml (update with database connection)
```

**What:**
Create PostgreSQL database and Redis instance on Render. Connect them to the backend service. Document connection strings in environment variables.

**Why:**
Managed database and Redis are required for persistence and real-time features. Setting them up early ensures they're ready when needed.

**Edge cases:**
- Database connection pooling
- Redis connection limits
- SSL requirements for production connections

**Acceptance criteria:**
- [ ] PostgreSQL database created on Render
- [ ] Redis instance created on Render
- [x] Database connected to backend service (internal connection)
- [x] Redis connected to backend service
- [x] Connection strings documented in .env.example
- [x] Connection strings set in Render environment variables
- [x] Backend can connect to both on startup (log success)

**Verification:**
```bash
# Check Render logs for successful database connection
# Backend should log: "Connected to PostgreSQL"
# Backend should log: "Connected to Redis"
```

**Estimated time:** 30 minutes

---

### Task 6: Test Infrastructure Setup

**Depends on:** Task 1

**Files to create:**
```
apps/web/
├── vitest.config.ts
├── src/
│   └── __tests__/
│       └── example.test.ts
apps/server/
├── vitest.config.ts
├── src/
│   └── __tests__/
│       └── example.test.ts
e2e/
├── playwright.config.ts
├── tests/
│   └── example.spec.ts
└── package.json
```

**What:**
Set up Vitest for unit/integration tests and Playwright for E2E tests. Create example tests that pass. Add test commands to CI pipeline.

**Why:**
Test infrastructure from day one means you can write tests as you build features, not retrofit them later. Tests run on every PR.

**Edge cases:**
- Test database isolation
- Mocking external services
- CI test parallelization

**Acceptance criteria:**
- [x] Vitest configured for frontend with React Testing Library
- [x] Vitest configured for backend
- [x] Playwright configured for E2E tests
- [x] Example tests pass in all three locations
- [x] `pnpm turbo test` runs all unit tests
- [ ] `pnpm turbo test:e2e` runs E2E tests
- [x] CI runs unit tests on every push
- [x] Coverage reporting configured

**Verification:**
```bash
pnpm turbo test
pnpm turbo test:e2e
# All tests should pass
```

**Estimated time:** 2-3 hours

---

## Phase B: Authentication & Core

> **Goal:** Users can sign in, and the core application structure is in place. All changes are automatically tested and deployed.

### Task 7: Database Schema & Prisma Setup

**Depends on:** Task 5

**Files to create/modify:**
```
apps/server/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   └── lib/
│       └── prisma.ts
└── package.json (add prisma scripts)
```

**What:**
Set up Prisma ORM with PostgreSQL, define the complete database schema (Users, Boards, Objects, Sessions), create the Prisma client singleton, and run initial migration.

**Why:**
Prisma provides type-safe database access, automatic migrations, and excellent DX. The schema is the foundation for all data operations.

**Edge cases:**
- Handle JSONB data for flexible object properties
- Ensure proper cascade deletion for related records
- Index strategy for 500+ objects per board queries
- Migration in production (CI/CD)

**Acceptance criteria:**
- [x] Prisma schema matches ARCHITECTURE.md specification
- [x] `npx prisma migrate dev` creates initial migration
- [x] Prisma client is properly exported as singleton
- [x] Database indexes are created for performance
- [x] Seed script can create test data
- [x] Migration runs automatically in Render build

**Verification:**
```bash
cd apps/server
npx prisma migrate dev
npx prisma studio # Verify schema in browser
```

**Tests to write:**
- [ ] Unit test: Prisma client singleton
- [ ] Integration test: Database connection

**Estimated time:** 2-3 hours

---

### Task 8: Authentication Implementation

**Depends on:** Task 7

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── app/api/auth/[...nextauth]/route.ts
│   ├── lib/auth/authOptions.ts
│   ├── components/auth/
│   │   ├── SignInButton.tsx
│   │   └── AuthProvider.tsx
│   └── types/next-auth.d.ts
apps/server/
├── src/
│   ├── lib/auth/session.ts
│   └── middleware/auth.ts
packages/shared/
└── src/types/user.ts
```

**What:**
Implement NextAuth.js with Google OAuth provider. Create session management, user creation on first login, and auth middleware for backend API protection.

**Why:**
Authentication is required for all board operations. OAuth provides low-friction user onboarding with Google.

**Edge cases:**
- Handle OAuth callback errors gracefully
- Merge user data on subsequent logins (avatar URL updates)
- Support anonymous session creation for collaborators
- Session expiration handling

**Acceptance criteria:**
- [x] "Sign in with Google" button initiates OAuth flow
- [x] Successful login creates/updates user in database
- [x] Session is available in frontend via useSession hook
- [x] Session is validated in backend middleware
- [x] Anonymous session creation endpoint works
- [x] Sign out clears session properly

**Tests to write:**
- [ ] Unit test: session validation helpers
- [ ] Integration test: Auth middleware
- [ ] E2E test: Sign in flow

**Verification:**
```bash
# Manual: Sign in with Google, verify session in dashboard
# Automated: Run E2E auth test
```

**Estimated time:** 4-5 hours

---

### Task 9: API Foundation & Middleware

**Depends on:** Task 7, Task 8

**Files to create/modify:**
```
apps/server/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── boards.ts
│   │   └── objects.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── rateLimit.ts
│   │   ├── cors.ts
│   │   └── validate.ts
│   └── lib/validators/
│       ├── board.ts
│       └── object.ts
```

**What:**
Set up Express server with middleware stack: CORS, rate limiting, error handling, request validation (Zod), and authentication middleware. Create base route structure and error response format.

**Why:**
A solid API foundation ensures consistent error handling, security, and validation across all endpoints.

**Edge cases:**
- Rate limiting per-user vs per-IP
- Error responses in consistent JSON format
- Request validation before auth check (avoid unnecessary auth overhead)
- CORS configuration for Vercel frontend

**Acceptance criteria:**
- [x] Express server starts and listens on configured port
- [x] CORS allows requests from frontend origin
- [x] Rate limiting returns 429 when exceeded
- [x] Zod validation returns 400 with error details
- [x] Authentication middleware rejects invalid sessions
- [x] Error handler returns consistent error format
- [x] Health check endpoint returns 200

**Tests to write:**
- [ ] Unit test: Validation schemas
- [ ] Unit test: Error handler formatting
- [ ] Integration test: Middleware stack
- [ ] Integration test: Rate limiting

**Verification:**
```bash
curl https://<backend-url>/health
curl -X POST https://<backend-url>/api/boards # Should return 401
```

**Estimated time:** 3-4 hours

---

### Task 10: WebSocket Server Setup

**Depends on:** Task 9

**Files to create/modify:**
```
apps/server/
├── src/
│   ├── socket/
│   │   ├── index.ts
│   │   ├── connection.ts
│   │   └── types.ts
│   ├── lib/
│   │   └── redis.ts
│   └── index.ts (update)
```

**What:**
Set up Socket.io server with CORS, authentication middleware for socket connections, Redis adapter for future scaling, and connection lifecycle handlers (connect, disconnect, reconnect).

**Why:**
WebSocket communication is core to real-time collaboration. Proper setup ensures reliable connections and enables horizontal scaling.

**Edge cases:**
- Socket authentication with NextAuth session
- Reconnection handling with session restoration
- Graceful shutdown with client notification
- Redis connection failures

**Acceptance criteria:**
- [x] Socket.io server attaches to Express HTTP server
- [x] CORS allows connections from frontend origin
- [x] Authentication middleware validates session on connection
- [x] Connection/disconnection events are logged
- [x] Redis adapter is configured (ready for scaling)
- [x] Client receives connection status events
- [x] Ping/pong keeps connections alive

**Tests to write:**
- [ ] Unit test: Socket authentication middleware
- [ ] Integration test: Connection lifecycle

**Verification:**
```bash
# Use socket.io-client to connect and verify auth
# Check Redis for connection data
```

**Estimated time:** 3-4 hours

---

### Task 11: Frontend Foundation

**Depends on:** Task 3, Task 8

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── api/client.ts
│   │   ├── socket/client.ts
│   │   └── utils/
│   │       └── cn.ts
│   └── providers/
│       └── Providers.tsx
```

**What:**
Set up Next.js 15 App Router foundation: root layout, providers (React Query, Theme, Session), UI primitives (Button, Input, Toast), API client, and utility functions. Configure Tailwind CSS with custom theme. Create protected dashboard route.

**Why:**
A solid frontend foundation enables rapid feature development with consistent styling and shared utilities.

**Edge cases:**
- Provider order matters (Session before Query, etc.)
- Tailwind dark mode support
- API client error handling
- Protected routes redirect to sign in

**Acceptance criteria:**
- [x] Next.js dev server runs without errors
- [x] Tailwind classes apply correctly
- [x] Session provider wraps application
- [x] Toast notifications can be triggered
- [x] API client can make authenticated requests
- [x] Dashboard page is protected (redirects if not signed in)
- [x] Landing page renders with header and sign in buttons

**Tests to write:**
- [ ] Unit test: API client
- [ ] Unit test: cn utility
- [ ] Component test: Button
- [ ] Component test: Header

**Verification:**
```bash
cd apps/web
pnpm dev
# Visit http://localhost:3000
# Try accessing /dashboard without auth, should redirect
```

**Estimated time:** 3-4 hours

---

### Task 12: Basic E2E Test (Auth Flow)

**Depends on:** Task 8, Task 11

**Files to create/modify:**
```
e2e/
├── tests/
│   ├── auth.spec.ts
│   └── home.spec.ts
└── fixtures/
    └── test-helpers.ts
```

**What:**
Write Playwright E2E tests for authentication flow and basic page loads. This validates the full stack works together.

**Why:**
E2E tests from day one catch integration issues early. Auth is the first real user flow to test.

**Edge cases:**
- CI-safe auth strategy (no live Google login in CI)
- Session persistence
- Protected route redirects

**Acceptance criteria:**
- [ ] E2E test: Landing page loads
- [ ] E2E test: Sign in page loads
- [ ] E2E test: Protected route redirects when not signed in
- [ ] E2E test: Sign in -> redirect to dashboard
- [ ] E2E test: Sign out -> redirect to landing
- [ ] CI uses test auth fixture (seeded test session cookie), not live OAuth provider
- [ ] Tests run in CI on every PR
- [ ] Tests use test database

**Verification:**
```bash
pnpm turbo test:e2e
# All E2E tests should pass
```

**Estimated time:** 2-3 hours

---

## Phase C: Core Board Features

> **Goal:** Users can create boards and manipulate objects on canvas. Features are built incrementally with tests.

### Task 13: Board CRUD Operations

**Depends on:** Task 8, Task 9

**Files to create/modify:**
```
apps/server/
├── src/
│   ├── services/BoardService.ts
│   ├── repositories/BoardRepository.ts
│   └── routes/boards.ts (update)
apps/web/
├── src/
│   ├── lib/api/boards.ts
│   └── hooks/useBoards.ts
packages/shared/
└── src/types/board.ts
```

**What:**
Implement board CRUD operations: create board with unique share link, list user's boards, get board by ID, get board by share link, rename board, delete board. Include share link generation logic.

**Why:**
Board management is the core domain. Users need to create, access, and manage their collaborative workspaces.

**Edge cases:**
- Share link uniqueness (generate with collision detection)
- Delete board disconnects all active users
- Rename board while collaborators are active
- Access control: owner vs share link access

**Acceptance criteria:**
- [ ] POST /api/boards creates board with unique share link
- [ ] GET /api/boards returns user's boards sorted by updated_at
- [ ] GET /api/boards/:id returns board details (owner or valid share-link session)
- [ ] GET /api/boards/share/:shareLink returns board (public)
- [ ] PATCH /api/boards/:id updates board name (owner only)
- [ ] DELETE /api/boards/:id removes board and all objects
- [ ] Share link is URL-safe and unique

**Tests to write:**
- [ ] Unit test: BoardService methods
- [ ] Unit test: Share link generation
- [ ] Integration test: Board CRUD endpoints
- [ ] Integration test: Access control

**Verification:**
```bash
# Create board
curl -X POST https://<backend-url>/api/boards \
  -H "Cookie: <session-cookie-name>=<session-cookie-value>"
# Get by share link
curl https://<backend-url>/api/boards/share/<shareLink>
```

**Estimated time:** 4-5 hours

---

### Task 14: Dashboard UI

**Depends on:** Task 11, Task 13

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── app/(dashboard)/
│   │   └── dashboard/
│   │       └── page.tsx (update)
│   ├── components/dashboard/
│   │   ├── BoardCard.tsx
│   │   ├── BoardList.tsx
│   │   ├── NewBoardButton.tsx
│   │   └── DeleteBoardModal.tsx
│   └── hooks/useBoards.ts (update)
```

**What:**
Create dashboard page with board list, create new board button, board cards with hover actions (rename, share, delete), and delete confirmation modal. Implement responsive grid layout.

**Why:**
Dashboard is the user's home for managing their boards. Clean UX enables quick access to workspaces.

**Edge cases:**
- Empty state when no boards exist
- Long board names (truncate with ellipsis)
- Delete while board card is hovered
- Optimistic updates for create/delete

**Acceptance criteria:**
- [ ] Dashboard displays "My Boards" section
- [ ] Each board shows name, last modified date
- [ ] "New Board" button creates board and navigates to it
- [ ] Hover on board card shows rename, share, delete actions
- [ ] Rename inline edits board name
- [ ] Share opens modal with copyable link
- [ ] Delete shows confirmation dialog
- [ ] Delete removes board from list immediately (optimistic)
- [ ] Responsive layout works on mobile

**Tests to write:**
- [ ] Component test: BoardCard
- [ ] Component test: BoardList
- [ ] Component test: DeleteBoardModal
- [ ] E2E test: Create board flow
- [ ] E2E test: Delete board flow

**Verification:**
```bash
# Manual: Create board, verify it appears
# Manual: Share board, verify link copies
# Manual: Delete board, verify confirmation and removal
```

**Estimated time:** 4-5 hours

---

### Task 15: Canvas Foundation

**Depends on:** Task 11

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── app/board/[id]/
│   │   └── page.tsx
│   ├── components/canvas/
│   │   ├── Canvas.tsx
│   │   ├── CanvasLayer.tsx
│   │   ├── GridOverlay.tsx
│   │   └── ZoomControls.tsx
│   ├── stores/
│   │   ├── canvasStore.ts
│   │   └── toolStore.ts
│   ├── hooks/
│   │   ├── useCanvas.ts
│   │   └── useZoom.ts
│   └── lib/konva/
│       └── stage.ts
```

**What:**
Implement Konva.js canvas with infinite pan/zoom, grid overlay, zoom controls, and stage configuration. Set up Zustand stores for canvas state and tool state.

**Why:**
Canvas is the core workspace. A solid foundation with 60 FPS panning and zooming is critical for user experience.

**Edge cases:**
- Zoom to cursor position (not center)
- Min/max zoom limits (10% to 400%)
- Stage drag vs object selection conflict
- Touch gestures for mobile

**Acceptance criteria:**
- [ ] Canvas renders full viewport
- [ ] Pan by dragging empty space (60 FPS)
- [ ] Zoom with mouse wheel centered on cursor
- [ ] Zoom controls (+/-) in corner
- [ ] Grid overlay visible (toggleable)
- [ ] Zoom level indicator shows percentage
- [ ] "Fit to content" zooms to show all objects
- [ ] Canvas state persists zoom/pan in URL params

**Tests to write:**
- [ ] Unit test: canvasStore
- [ ] Unit test: toolStore
- [ ] Unit test: Zoom calculations
- [ ] E2E test: Canvas loads for board

**Verification:**
```bash
# Manual: Pan around canvas, verify smoothness
# Manual: Zoom in/out, verify cursor centering
# Manual: Toggle grid, verify visibility
```

**Estimated time:** 5-6 hours

---

### Task 16: Object System - Data Layer

**Depends on:** Task 13

**Files to create/modify:**
```
apps/server/
├── src/
│   ├── services/ObjectService.ts
│   ├── repositories/ObjectRepository.ts
│   └── routes/objects.ts
apps/web/
├── src/
│   ├── stores/objectStore.ts
│   ├── types/objects.ts
│   └── lib/utils/id.ts
packages/shared/
└── src/types/objects.ts
```

**What:**
Implement object CRUD operations in backend, create ObjectService with batch operations, set up frontend object store with Zustand, define TypeScript types for all object types (sticky, rectangle, circle, line, connector, text, frame).

**Why:**
Objects are the core content on boards. The data layer must support efficient CRUD, batch operations, and type safety.

**Edge cases:**
- Batch operations with partial failures
- Z-index management (auto-assign on create)
- Object type validation
- Maximum objects per board limit

**Acceptance criteria:**
- [ ] POST /api/boards/:id/objects creates single object
- [ ] POST /api/objects/batch creates/updates/deletes multiple objects
- [ ] GET /api/boards/:id/objects returns all objects
- [ ] PATCH /api/objects/:id updates object
- [ ] DELETE /api/objects/:id removes object
- [ ] Object store supports optimistic updates
- [ ] TypeScript types match database schema

**Tests to write:**
- [ ] Unit test: ObjectService methods
- [ ] Unit test: objectStore actions
- [ ] Integration test: Object CRUD endpoints
- [ ] Integration test: Batch operations

**Verification:**
```bash
# Create object
curl -X POST https://<backend-url>/api/boards/<id>/objects \
  -H "Content-Type: application/json" \
  -d '{"type":"rectangle","x":100,"y":100,"width":200,"height":150}'
```

**Estimated time:** 4-5 hours

---

### Task 17: Object System - Canvas Rendering

**Depends on:** Task 15, Task 16

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── components/canvas/
│   │   ├── ObjectRenderer.tsx
│   │   └── objects/
│   │       ├── StickyNote.tsx
│   │       ├── Rectangle.tsx
│   │       ├── Circle.tsx
│   │       ├── Line.tsx
│   │       ├── Connector.tsx
│   │       ├── TextElement.tsx
│   │       └── Frame.tsx
│   └── hooks/useObjects.ts
```

**What:**
Create object rendering components for each object type. Implement ObjectRenderer that dynamically renders objects based on type. Connect to object store for reactive updates.

**Why:**
Visual rendering of objects is core functionality. Each object type has unique rendering needs and interactions.

**Edge cases:**
- Rendering 500+ objects efficiently
- Object visibility (virtual rendering)
- Connector re-routing when connected objects move
- Text editing in sticky notes

**Acceptance criteria:**
- [ ] StickyNote renders with text and color
- [ ] Rectangle renders with fill and stroke
- [ ] Circle renders as ellipse
- [ ] Line renders from point to point
- [ ] Connector renders with arrow heads
- [ ] TextElement renders with font styling
- [ ] Frame renders with title bar and border
- [ ] Objects update when store changes
- [ ] Performance: 60 FPS with 100 objects

**Tests to write:**
- [ ] Component test: Each object type
- [ ] Component test: ObjectRenderer
- [ ] E2E test: Object rendering

**Verification:**
```bash
# Manual: Add each object type via API, verify render
# Manual: Create 100 objects, verify FPS
```

**Estimated time:** 6-7 hours

---

### Task 18: Object Manipulation (Move, Resize, Rotate)

**Depends on:** Task 17

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── components/canvas/
│   │   ├── SelectionManager.tsx
│   │   └── Transformer.tsx
│   ├── stores/
│   │   ├── selectionStore.ts
│   │   └── objectStore.ts (update)
│   └── hooks/
│       ├── useSelection.ts
│       └── useTransform.ts
```

**What:**
Implement object selection (single and multi-select), transform handles for resize/rotate, drag to move, keyboard nudging, and multi-object transforms.

**Why:**
Object manipulation is core interaction. Users need to position and size objects freely with smooth performance.

**Edge cases:**
- Multi-select bounding box calculation
- Aspect ratio constraint during resize
- Rotation snaps to 15° with shift
- Minimum object size constraints
- Transform while zoomed

**Acceptance criteria:**
- [ ] Click selects object, shows bounding box
- [ ] Shift+click adds/removes from selection
- [ ] Marquee select (drag on empty space)
- [ ] Drag moves selected object(s)
- [ ] Arrow keys nudge by 1px, Shift+arrow by 10px
- [ ] Corner handles resize proportionally
- [ ] Shift maintains aspect ratio during resize
- [ ] Rotation handle above selection
- [ ] Shift constrains rotation to 15° increments

**Tests to write:**
- [ ] Unit test: selectionStore
- [ ] Unit test: Transform calculations
- [ ] Component test: Transformer
- [ ] E2E test: Object manipulation

**Verification:**
```bash
# Manual: Select, move, resize, rotate objects
# Manual: Multi-select with shift+click
# Manual: Marquee select multiple objects
```

**Estimated time:** 6-8 hours

---

## Phase D: Real-Time Collaboration

> **Goal:** Multiple users can collaborate in real-time with <100ms sync latency.

### Task 19: Real-Time Object Sync

**Depends on:** Task 10, Task 16, Task 18

**Files to create/modify:**
```
apps/server/
├── src/
│   ├── socket/
│   │   ├── objects.ts
│   │   └── board.ts
│   └── services/SyncService.ts
apps/web/
├── src/
│   ├── lib/socket/
│   │   ├── client.ts (update)
│   │   └── events.ts
│   └── hooks/useSocket.ts
```

**What:**
Implement socket events for object CRUD operations. Broadcast create/update/delete to all users in board room. Handle reconnection and state sync.

**Why:**
Real-time sync enables collaboration. Changes must propagate to all users with <100ms latency.

**Edge cases:**
- User joins mid-session (sync existing state)
- Reconnection after disconnect
- Large batch operations
- Sync failure handling

**Acceptance criteria:**
- [ ] object:create broadcasts to room
- [ ] object:update broadcasts to room
- [ ] object:delete broadcasts to room
- [ ] Board join sends current state
- [ ] Reconnection resyncs state
- [ ] Sync latency <100ms (measured)
- [ ] Failed sync shows error notification

**Tests to write:**
- [ ] Unit test: SyncService
- [ ] Integration test: Socket object events
- [ ] E2E test: Multi-user sync

**Verification:**
```bash
# Open two browser windows, create object in one, verify appears in other
# Measure time from create to appear
```

**Estimated time:** 5-6 hours

---

### Task 20: Cursor Presence

**Depends on:** Task 10, Task 15

**Files to create/modify:**
```
apps/server/
├── src/
│   ├── socket/
│   │   └── cursor.ts
│   └── services/PresenceService.ts
apps/web/
├── src/
│   ├── components/canvas/
│   │   └── CursorOverlay.tsx
│   ├── stores/
│   │   └── presenceStore.ts
│   └── hooks/
│       └── useCursor.ts
```

**What:**
Implement cursor position broadcasting, remote cursor rendering with name labels, cursor color assignment, and cursor throttling (16ms for 60 FPS).

**Why:**
Cursor presence shows where collaborators are working, reducing conflicts and enabling awareness.

**Edge cases:**
- Throttling for performance
- Cursor fade on inactivity
- Unique colors for each user
- Name label positioning (avoid overlap)

**Acceptance criteria:**
- [ ] cursor:move broadcasts at 60 FPS max
- [ ] Remote cursors render with unique colors
- [ ] Name label appears next to cursor
- [ ] Cursor fades after 5 seconds inactivity
- [ ] Cursor disappears on disconnect
- [ ] Anonymous users show "(Guest)" label
- [ ] Latency <50ms (measured)

**Tests to write:**
- [ ] Unit test: Cursor throttling
- [ ] Unit test: presenceStore
- [ ] Component test: CursorOverlay
- [ ] E2E test: Multi-user cursors

**Verification:**
```bash
# Open two windows, move cursor in one, verify appears in other
# Verify cursor color is different for each user
```

**Estimated time:** 4-5 hours

---

### Task 21: User Presence System

**Depends on:** Task 20

**Files to create/modify:**
```
apps/server/
├── src/
│   ├── socket/
│   │   └── connection.ts (update)
│   └── services/PresenceService.ts (update)
apps/web/
├── src/
│   ├── components/board/
│   │   └── PresenceIndicator.tsx
│   └── stores/
│       └── presenceStore.ts (update)
```

**What:**
Implement presence tracking: join/leave events, active users list, presence indicator UI, and Redis storage for presence data.

**Why:**
Users need to know who else is on the board for effective collaboration.

**Edge cases:**
- Same user in multiple tabs
- Presence cleanup on disconnect
- Long presence list (scrollable)

**Acceptance criteria:**
- [ ] Join event adds user to presence list
- [ ] Leave event removes user from presence list
- [ ] Presence indicator shows all active users
- [ ] Avatar or colored circle for each user
- [ ] User count displayed (e.g., "3 active")
- [ ] Presence persists in Redis with TTL
- [ ] Reconnection restores presence

**Tests to write:**
- [ ] Unit test: PresenceService
- [ ] Component test: PresenceIndicator
- [ ] E2E test: Presence updates

**Verification:**
```bash
# Open board in multiple windows, verify presence count
# Close a window, verify user removed
```

**Estimated time:** 3-4 hours

---

### Task 22: Connection Resilience

**Depends on:** Task 10, Task 19

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── components/board/
│   │   └── ConnectionStatus.tsx
│   ├── lib/socket/
│   │   └── client.ts (update)
│   └── hooks/
│       └── useSocket.ts (update)
```

**What:**
Implement connection status indicator, reconnection with exponential backoff, offline operation queueing, and reconnect sync.

**Why:**
Network issues are common. Users should be able to continue working and have changes sync when reconnected.

**Edge cases:**
- Long disconnection (>30 seconds)
- Changes made while offline
- Multiple failed reconnect attempts
- Server restart during session

**Acceptance criteria:**
- [ ] Connection status indicator visible
- [ ] "Reconnecting..." overlay on disconnect
- [ ] Exponential backoff for reconnection attempts
- [ ] Local changes queue while disconnected
- [ ] Queued changes sync on reconnect
- [ ] Full state resync on reconnect
- [ ] After 30s, offer save/reload options

**Tests to write:**
- [ ] Unit test: Reconnection logic
- [ ] Unit test: Offline queue
- [ ] E2E test: Disconnect/reconnect

**Verification:**
```bash
# Disable network, verify reconnect overlay
# Make changes while offline, enable network, verify sync
```

**Estimated time:** 4-5 hours

---

### Task 23: Conflict Resolution & Optimistic Updates

**Depends on:** Task 19

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── stores/
│   │   └── objectStore.ts (update)
│   └── lib/
│       └── optimistic.ts
apps/server/
├── src/
│   └── services/SyncService.ts (update)
```

**What:**
Implement optimistic updates in frontend, last-write-wins conflict resolution, server timestamp authority, and reconciliation on server response.

**Why:**
Optimistic updates provide instant feedback. Conflict resolution ensures data consistency.

**Edge cases:**
- Conflicting updates to same object
- Server reject after optimistic update
- Network delay causing reorder

**Acceptance criteria:**
- [ ] Local changes appear immediately (optimistic)
- [ ] Server response reconciles with local state
- [ ] Conflicts resolved by last-write-wins
- [ ] Server timestamp is authoritative
- [ ] Conflicting updates don't cause flicker
- [ ] Users see each other's selections

**Tests to write:**
- [ ] Unit test: Optimistic update logic
- [ ] Unit test: Conflict resolution
- [ ] Integration test: Concurrent updates

**Verification:**
```bash
# Two users update same object simultaneously
# Verify last update wins
# Verify no visible flicker
```

**Estimated time:** 4-5 hours

---

## Phase E: UI/UX Polish

> **Goal:** Professional UI with efficient workflows.

### Task 24: Toolbar Implementation

**Depends on:** Task 15, Task 18

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── components/toolbar/
│   │   ├── Toolbar.tsx
│   │   └── ToolButton.tsx
│   └── stores/
│       └── toolStore.ts (update)
```

**What:**
Implement top toolbar with tool buttons, active tool highlighting, tooltips with shortcuts, and tool switching logic.

**Why:**
Toolbar provides quick access to all tools. Clear visual feedback helps users understand current mode.

**Edge cases:**
- Tool persistence across sessions
- Tool switch during object creation
- Collapsed toolbar for maximum canvas space

**Acceptance criteria:**
- [ ] Toolbar at top of board page
- [ ] Tools: Select, Text, Rectangle, Circle, Line, Connector, Sticky, Frame
- [ ] Active tool highlighted
- [ ] Hover shows tooltip with name and shortcut
- [ ] Keyboard switches tools (V, T, R, O, L, C, S, F)
- [ ] Toolbar can be collapsed

**Tests to write:**
- [ ] Component test: Toolbar
- [ ] Component test: ToolButton
- [ ] E2E test: Tool switching

**Verification:**
```bash
# Manual: Click each tool, verify active state
# Manual: Press keyboard shortcuts, verify tool switch
```

**Estimated time:** 3-4 hours

---

### Task 25: Left Panel (Object Library)

**Depends on:** Task 24

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── components/panels/
│   │   ├── LeftPanel.tsx
│   │   └── ObjectLibrary.tsx
│   └── hooks/useDragCreate.ts
```

**What:**
Implement collapsible left panel with object library. Support drag-to-create from panel to canvas.

**Why:**
Object library provides visual browsing of available shapes. Drag-to-create is intuitive interaction pattern.

**Edge cases:**
- Panel resize (optional)
- Drag preview during create
- Collapse state persistence

**Acceptance criteria:**
- [ ] Left panel is collapsible
- [ ] Panel shows object icons: shapes, sticky, text, frame
- [ ] Drag from panel to canvas creates object
- [ ] Object created at drop position
- [ ] Panel state persists (collapsed/expanded)

**Tests to write:**
- [ ] Component test: LeftPanel
- [ ] Component test: ObjectLibrary
- [ ] E2E test: Drag to create

**Verification:**
```bash
# Manual: Drag each object type from panel
# Manual: Collapse panel, reload, verify state
```

**Estimated time:** 3-4 hours

---

### Task 26: Right Panel (Properties)

**Depends on:** Task 18

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── components/panels/
│   │   ├── RightPanel.tsx
│   │   └── PropertiesPanel.tsx
│   ├── components/ui/
│   │   └── ColorPicker.tsx
│   └── hooks/useProperties.ts
```

**What:**
Implement collapsible right panel with properties editor. Show relevant properties for selected object type. Include color picker, font controls, and position/size inputs.

**Why:**
Properties panel enables precise control over object appearance. Context-aware editing improves efficiency.

**Edge cases:**
- No selection state
- Multi-selection (show common properties)
- Invalid input handling

**Acceptance criteria:**
- [ ] Right panel is collapsible
- [ ] Shows "No selection" when nothing selected
- [ ] Shows position (x, y), size (w, h), rotation
- [ ] Shows type-specific properties (fill, stroke, font)
- [ ] Changes apply immediately
- [ ] Color picker for fill/stroke colors
- [ ] Panel state persists
- [ ] Reserved space for future AI chat

**Tests to write:**
- [ ] Component test: RightPanel
- [ ] Component test: PropertiesPanel
- [ ] Component test: ColorPicker
- [ ] E2E test: Property editing

**Verification:**
```bash
# Manual: Select object, modify properties, verify changes
# Manual: Use color picker, verify color changes
```

**Estimated time:** 4-5 hours

---

### Task 27: Keyboard Shortcuts

**Depends on:** Task 18, Task 24

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts
│   └── lib/utils/shortcuts.ts
```

**What:**
Implement comprehensive keyboard shortcuts for all tools and operations. Handle modifier keys (Shift, Ctrl/Cmd) for constrained operations.

**Why:**
Keyboard shortcuts dramatically improve efficiency for power users.

**Edge cases:**
- Shortcut conflicts with text input
- Cross-platform (Mac vs Windows)
- Preventing browser defaults

**Acceptance criteria:**
- [ ] V: Select tool
- [ ] T: Text tool
- [ ] R: Rectangle tool
- [ ] O: Circle tool
- [ ] L: Line tool
- [ ] C: Connector tool
- [ ] S: Sticky note tool
- [ ] F: Frame tool
- [ ] Delete/Backspace: Delete selected
- [ ] Ctrl+D: Duplicate
- [ ] Ctrl+C/V: Copy/Paste
- [ ] Ctrl+A: Select all
- [ ] Ctrl+Z: Undo
- [ ] Ctrl+Shift+Z: Redo
- [ ] Space (hold): Pan mode
- [ ] Shortcuts documented in help modal

**Tests to write:**
- [ ] Unit test: Shortcut handlers
- [ ] E2E test: Keyboard shortcuts

**Verification:**
```bash
# Manual: Test each shortcut
# Manual: Verify shortcuts work during text editing (should not)
```

**Estimated time:** 3-4 hours

---

### Task 28: Undo/Redo System

**Depends on:** Task 18, Task 19

**Files to create/modify:**
```
apps/web/
├── src/
│   ├── lib/
│   │   └── history.ts
│   ├── stores/
│   │   └── historyStore.ts
│   └── hooks/
│       └── useUndoRedo.ts
```

**What:**
Implement per-user undo/redo stack with action types for create, update, delete, and transform. Limit stack size to 50 actions.

**Why:**
Undo/redo is essential for recovering from mistakes. Per-user stack avoids confusion in collaborative editing.

**Edge cases:**
- Undo during collaborative session
- Stack overflow (max 50 items)
- Clear on page reload

**Acceptance criteria:**
- [ ] Ctrl+Z undoes last action
- [ ] Ctrl+Shift+Z redoes last undone action
- [ ] Undo works for: create, update, delete, transform
- [ ] Undo stack per-user (not global)
- [ ] Stack limited to 50 actions
- [ ] Stack cleared on page reload
- [ ] Undo doesn't affect other users

**Tests to write:**
- [ ] Unit test: historyStore
- [ ] Unit test: History actions
- [ ] E2E test: Undo/redo flow

**Verification:**
```bash
# Manual: Create, move, delete objects
# Manual: Undo each, verify state
# Manual: Redo, verify state
```

**Estimated time:** 4-5 hours

---

## Task Dependencies Graph

```
Phase A: Deployment Foundation
Task 1 ───┬──▶ Task 2 ───┬──▶ Task 3 (Vercel Deploy)
          │              │
          │              └──▶ Task 4 ───▶ Task 5 (Database/Redis)
          │
          └──▶ Task 6 (Test Infrastructure)

Phase B: Auth & Core
Task 5 ───▶ Task 7 ───▶ Task 8 ───▶ Task 9 ───▶ Task 10
                                        │
Task 3 ───▶ Task 11 ────────────────────┘
              │
              └──▶ Task 12 (E2E Auth Test)

Phase C: Board Features
Task 8,9 ───▶ Task 13 ───▶ Task 14 (Dashboard)
                │
                └──▶ Task 16 ───▶ Task 17 ───▶ Task 18
                                    │
Task 11 ───▶ Task 15 ───────────────┘

Phase D: Real-Time
Task 10 ───▶ Task 19 ───▶ Task 22, Task 23
    │
    └──▶ Task 20 ───▶ Task 21

Phase E: Polish
Task 15,18 ───▶ Task 24 ───▶ Task 25
                  │
Task 18 ─────────┼──▶ Task 26
                  │
                  └──▶ Task 27
Task 18,19 ───▶ Task 28
```

---

## Total Estimated Time

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| A: Deployment Foundation | 1-6 | 8-11 hours |
| B: Authentication & Core | 7-12 | 16-21 hours |
| C: Core Board Features | 13-18 | 27-34 hours |
| D: Real-Time Collaboration | 19-23 | 20-25 hours |
| E: UI/UX Polish | 24-28 | 17-22 hours |
| **Total** | **28 tasks** | **88-113 hours** |

---

## CI/CD Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT-FIRST DEVELOPMENT FLOW                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Every Commit:                                                                  │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐                  │
│   │  Push   │────▶│  Lint   │────▶│ Type-   │────▶│  Build  │                  │
│   │  Code   │     │         │     │ Check   │     │         │                  │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘                  │
│                                                          │                       │
│   PR:                                                    ▼                       │
│   ┌─────────┐                                     ┌─────────┐                   │
│   │  Unit   │────────────────────────────────────▶│ Preview  │                   │
│   │  Tests  │                                     │ Deploy   │                   │
│   └─────────┘                                     └─────────┘                   │
│                                                          │                       │
│   Merge to Main:                                         ▼                       │
│   ┌─────────┐                                     ┌─────────┐                   │
│   │  E2E    │────────────────────────────────────▶│Production│                   │
│   │  Tests  │                                     │ Deploy   │                   │
│   └─────────┘                                     └─────────┘                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Change Log Process

- `CHANGELOG.md` is required and updated on every commit.
- Each entry should include: summary, decisions, mistakes/fixes, and lessons learned.
- If no mistakes occurred in a commit, add `Mistakes/Lessons: none this commit`.

---

## Key Differences from Original Approach

| Aspect | Original | Deployment-First |
|--------|----------|------------------|
| CI/CD | Task 25 (end) | Task 2 (beginning) |
| Deployment | Task 26 (end) | Tasks 3-4 (beginning) |
| Testing | Tasks 23-24 (end) | Task 6 + per-task tests |
| Tests per feature | Retrofit later | Write with each task |
| Deployable | Only at end | From Task 1 |
| Risk profile | High (big bang deploy) | Low (always deployable) |

---

**Document Version:** 2.0 (Deployment-First)  
**Last Updated:** Phase 2 Complete  
**Repository:** https://github.com/Tanner-Eischen/CollabCanva-GFA.git  
**Status:** Ready for Phase 3: Scaffold & Environment Setup
