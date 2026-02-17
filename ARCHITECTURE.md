# ARCHITECTURE.md

## Project: CollabBoard

> System architecture, file structure, and task decomposition for the collaborative whiteboard application.

---

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                        Next.js 15 Application                             │  │
│   │                        (Deployed on Vercel)                               │  │
│   │                                                                           │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│   │   │   Pages     │  │  Components │  │   Hooks     │  │   Stores    │    │  │
│   │   │  (App Router)│  │  (React)    │  │  (Custom)   │  │  (Zustand)  │    │  │
│   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│   │                                                                           │  │
│   │   ┌─────────────────────────────────────────────────────────────────┐    │  │
│   │   │                    Canvas Layer (Konva.js)                       │    │  │
│   │   │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │  │
│   │   │   │  Stage   │ │  Layer   │ │  Shapes  │ │Transformers│          │    │  │
│   │   │   └──────────┘ └──────────┘ └──────────┘ └──────────┘          │    │  │
│   │   └─────────────────────────────────────────────────────────────────┘    │  │
│   │                                                                           │  │
│   │   ┌─────────────────────────────────────────────────────────────────┐    │  │
│   │   │              Real-Time Layer (Socket.io-client)                  │    │  │
│   │   │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │  │
│   │   │   │  Socket  │ │ Presence │ │  Sync    │ │  Cursor  │          │    │  │
│   │   │   │  Manager │ │  Manager │ │  Queue   │ │  Overlay │          │    │  │
│   │   │   └──────────┘ └──────────┘ └──────────┘ └──────────┘          │    │  │
│   │   └─────────────────────────────────────────────────────────────────┘    │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS / WSS
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   API GATEWAY                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌────────────────────────────┐         ┌────────────────────────────┐         │
│   │       Vercel Runtime       │         │    Render Load Balancer    │         │
│   │       (Next.js App)        │         │   (REST + WebSocket)       │         │
│   │                            │         │                            │         │
│   │  • App Router pages        │         │  • /api/boards/* (REST)    │         │
│   │  • /api/auth/* (NextAuth)  │         │  • /api/objects/* (REST)   │         │
│   │  • SSR/SSG                 │         │  • Socket.io handshake/WSS │         │
│   └────────────────────────────┘         └────────────────────────────┘         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                     Node.js + Express Server                              │  │
│   │                     (Deployed on Render)                                  │  │
│   │                                                                           │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│   │   │ REST API    │  │ WebSocket   │  │  Auth       │  │  Board      │    │  │
│   │   │ Routes      │  │ Handler     │  │  Service    │  │  Service    │    │  │
│   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│   │                                                                           │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│   │   │ Object      │  │ Presence    │  │  Sync       │  │  Event      │    │  │
│   │   │ Service     │  │ Service     │  │  Service    │  │  Emitter    │    │  │
│   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌────────────────────────────┐         ┌────────────────────────────┐         │
│   │      PostgreSQL            │         │         Redis              │         │
│   │      (Render Managed)      │         │      (Render Managed)      │         │
│   │                            │         │                            │         │
│   │  • users                   │         │  • presence:board:{id}     │         │
│   │  • boards                  │         │  • cursor:board:{id}       │         │
│   │  • objects                 │         │  • session:{id}            │         │
│   │  • sessions (board presence)│        │  • pub/sub channels        │         │
│   │                            │         │                            │         │
│   └────────────────────────────┘         └────────────────────────────┘         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND COMPONENTS                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   PAGES (App Router)                                                            │
│   ├── / (Landing Page)                    → SSR, public                        │
│   ├── /dashboard (Board List)             → SSR, protected                      │
│   ├── /board/[id] (Board Canvas)          → CSR, protected/public              │
│   └── /auth/signin (Login Page)           → SSR, public                        │
│                                                                                  │
│   LAYOUT COMPONENTS                                                             │
│   ├── RootLayout                          → HTML wrapper, providers             │
│   ├── DashboardLayout                     → Dashboard shell, nav               │
│   └── BoardLayout                         → Canvas shell, panels               │
│                                                                                  │
│   CANVAS COMPONENTS                                                             │
│   ├── Canvas                              → Main Konva stage                    │
│   ├── CanvasLayer                         → Konva layer wrapper                │
│   ├── ObjectRenderer                      → Dynamic object rendering           │
│   │   ├── StickyNote                      → Sticky note shape                  │
│   │   ├── Rectangle                       → Rectangle shape                    │
│   │   ├── Circle                          → Circle/ellipse shape               │
│   │   ├── Line                            → Line shape                         │
│   │   ├── Connector                       → Connector with arrows              │
│   │   ├── TextElement                     → Text element                       │
│   │   └── Frame                           → Frame container                    │
│   ├── SelectionManager                    → Multi-select, bounding box         │
│   ├── Transformer                         → Resize/rotate handles              │
│   ├── GridOverlay                         → Grid pattern layer                 │
│   ├── CursorOverlay                       → Remote cursor rendering            │
│   └── SelectionOverlay                    → Remote selection indicators        │
│                                                                                  │
│   UI COMPONENTS                                                                 │
│   ├── Toolbar                             → Top toolbar                         │
│   ├── LeftPanel                           → Object library, collapsible        │
│   ├── RightPanel                          → Properties panel, collapsible      │
│   │   ├── PropertiesPanel                 → Object properties editor           │
│   │   └── AIChatPanel (future)            → AI assistant interface             │
│   ├── PresenceIndicator                   → Active users list                  │
│   ├── ShareModal                          → Share link generation              │
│   ├── ConnectionStatus                    → Online/offline indicator           │
│   └── ZoomControls                        → Zoom in/out, fit to content        │
│                                                                                  │
│   FORM COMPONENTS                                                               │
│   ├── ColorPicker                         → Color selection                    │
│   ├── FontSelector                        → Font family/size selection         │
│   └── BoardNameInput                      → Board rename input                 │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Backend Components

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND COMPONENTS                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   SERVERS                                                                       │
│   ├── HTTP Server (Express)              → REST API endpoints                  │
│   └── WebSocket Server (Socket.io)       → Real-time communication            │
│                                                                                  │
│   ROUTES                                                                        │
│   ├── /api/boards                         → Board CRUD                         │
│   ├── /api/boards/:id/objects             → Object CRUD                        │
│   └── /api/objects/:id                    → Single object operations           │
│                                                                                  │
│   MIDDLEWARE                                                                    │
│   ├── authMiddleware                      → Session validation                 │
│   ├── rateLimiter                         → Request throttling                 │
│   ├── corsMiddleware                      → CORS handling                      │
│   ├── errorHandler                        → Global error handling              │
│   └── validationMiddleware                → Request validation (Zod)           │
│                                                                                  │
│   SERVICES                                                                      │
│   ├── AuthService                         → OAuth flow, session management     │
│   ├── BoardService                        → Board CRUD, ownership              │
│   ├── ObjectService                       → Object CRUD, batch operations      │
│   ├── PresenceService                     → User presence tracking             │
│   ├── SyncService                         → Real-time sync orchestration       │
│   └── AnonSessionService                  → Anonymous user sessions            │
│                                                                                  │
│   SOCKET HANDLERS                                                               │
│   ├── ConnectionHandler                   → Connect/disconnect events          │
│   ├── BoardHandler                        → Join/leave board rooms             │
│   ├── CursorHandler                       → Cursor position broadcasting       │
│   ├── ObjectHandler                       → Object operation broadcasting      │
│   └── SelectionHandler                    → Selection state broadcasting       │
│                                                                                  │
│   REPOSITORIES (Prisma)                                                         │
│   ├── UserRepository                      → User data access                   │
│   ├── BoardRepository                     → Board data access                  │
│   ├── ObjectRepository                    → Object data access                 │
│   └── SessionRepository                   → Board session access               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Object Creation Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │  Canvas  │     │  Socket  │     │  Server  │     │ Database │
│  Action  │     │  Store   │     │  Client  │     │ (Socket) │     │ (Prisma) │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ Create object  │                │                │                │
     │───────────────▶│                │                │                │
     │                │                │                │                │
     │                │ Optimistic     │                │                │
     │                │ update (local) │                │                │
     │                │───────────────▶│                │                │
     │                │                │                │                │
     │                │                │ object:create  │                │
     │                │                │───────────────▶│                │
     │                │                │                │                │
     │                │                │                │ Validate       │
     │                │                │                │───────────────▶│
     │                │                │                │                │
     │                │                │                │ Persist        │
     │                │                │                │◀───────────────│
     │                │                │                │                │
     │                │                │                │ Broadcast      │
     │                │                │                │ to room        │
     │                │                │◀───────────────│                │
     │                │                │                │                │
     │                │                │ object:created │                │
     │                │◀───────────────│ (with server ID)                │
     │                │                │                │                │
     │                │ Update local   │                │                │
     │                │ with server ID │                │                │
     │                │                │                │                │
```

### Cursor Sync Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │  Canvas  │     │  Socket  │     │  Server  │     │  Redis   │
│  Action  │     │  Events  │     │  Client  │     │ (Socket) │     │  Cache   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ Mouse move     │                │                │                │
     │───────────────▶│                │                │                │
     │                │                │                │                │
     │                │ Throttle 16ms  │                │                │
     │                │ (60 FPS)       │                │                │
     │                │───────────────▶│                │                │
     │                │                │                │                │
     │                │                │ cursor:move    │                │
     │                │                │───────────────▶│                │
     │                │                │                │                │
     │                │                │                │ Store in Redis │
     │                │                │                │───────────────▶│
     │                │                │                │                │
     │                │                │                │ Broadcast      │
     │                │                │                │ to room        │
     │                │                │◀───────────────│                │
     │                │                │                │                │
     │                │                │ cursor:update  │                │
     │                │◀───────────────│                │                │
     │                │                │                │                │
     │                │ Render remote  │                │                │
     │                │ cursors        │                │                │
     │                │                │                │                │
```

---

## File & Folder Structure

### Monorepo Structure

```
collabboard/
├── apps/
│   ├── web/                          # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (auth)/           # Auth route group
│   │   │   │   │   ├── signin/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (dashboard)/      # Dashboard route group
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── board/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── api/              # API routes (NextAuth)
│   │   │   │   │   └── auth/
│   │   │   │   │       └── [...nextauth]/
│   │   │   │   │           └── route.ts
│   │   │   │   ├── layout.tsx        # Root layout
│   │   │   │   ├── page.tsx          # Landing page
│   │   │   │   └── globals.css
│   │   │   │
│   │   │   ├── components/           # React components
│   │   │   │   ├── canvas/           # Canvas-specific components
│   │   │   │   │   ├── Canvas.tsx
│   │   │   │   │   ├── CanvasLayer.tsx
│   │   │   │   │   ├── ObjectRenderer.tsx
│   │   │   │   │   ├── objects/      # Object type components
│   │   │   │   │   │   ├── StickyNote.tsx
│   │   │   │   │   │   ├── Rectangle.tsx
│   │   │   │   │   │   ├── Circle.tsx
│   │   │   │   │   │   ├── Line.tsx
│   │   │   │   │   │   ├── Connector.tsx
│   │   │   │   │   │   ├── TextElement.tsx
│   │   │   │   │   │   └── Frame.tsx
│   │   │   │   │   ├── SelectionManager.tsx
│   │   │   │   │   ├── Transformer.tsx
│   │   │   │   │   ├── GridOverlay.tsx
│   │   │   │   │   ├── CursorOverlay.tsx
│   │   │   │   │   └── SelectionOverlay.tsx
│   │   │   │   │
│   │   │   │   ├── layout/           # Layout components
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── Footer.tsx
│   │   │   │   │
│   │   │   │   ├── panels/           # Panel components
│   │   │   │   │   ├── LeftPanel.tsx
│   │   │   │   │   ├── RightPanel.tsx
│   │   │   │   │   ├── PropertiesPanel.tsx
│   │   │   │   │   └── ObjectLibrary.tsx
│   │   │   │   │
│   │   │   │   ├── toolbar/          # Toolbar components
│   │   │   │   │   ├── Toolbar.tsx
│   │   │   │   │   ├── ToolButton.tsx
│   │   │   │   │   └── ZoomControls.tsx
│   │   │   │   │
│   │   │   │   ├── ui/               # Shared UI components
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── ColorPicker.tsx
│   │   │   │   │   ├── Tooltip.tsx
│   │   │   │   │   └── Toast.tsx
│   │   │   │   │
│   │   │   │   ├── board/            # Board page components
│   │   │   │   │   ├── BoardLayout.tsx
│   │   │   │   │   ├── PresenceIndicator.tsx
│   │   │   │   │   ├── ShareModal.tsx
│   │   │   │   │   └── ConnectionStatus.tsx
│   │   │   │   │
│   │   │   │   └── dashboard/        # Dashboard components
│   │   │   │       ├── BoardCard.tsx
│   │   │   │       ├── BoardList.tsx
│   │   │   │       └── NewBoardButton.tsx
│   │   │   │
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   │   ├── useCanvas.ts
│   │   │   │   ├── useSelection.ts
│   │   │   │   ├── useObjects.ts
│   │   │   │   ├── useSocket.ts
│   │   │   │   ├── usePresence.ts
│   │   │   │   ├── useCursor.ts
│   │   │   │   ├── useKeyboardShortcuts.ts
│   │   │   │   └── useUndoRedo.ts
│   │   │   │
│   │   │   ├── stores/               # Zustand stores
│   │   │   │   ├── canvasStore.ts
│   │   │   │   ├── objectStore.ts
│   │   │   │   ├── selectionStore.ts
│   │   │   │   ├── presenceStore.ts
│   │   │   │   ├── toolStore.ts
│   │   │   │   └── uiStore.ts
│   │   │   │
│   │   │   ├── lib/                  # Utilities and libraries
│   │   │   │   ├── socket/           # Socket.io client setup
│   │   │   │   │   ├── client.ts
│   │   │   │   │   └── events.ts
│   │   │   │   ├── konva/            # Konva utilities
│   │   │   │   │   ├── shapes.ts
│   │   │   │   │   ├── transformers.ts
│   │   │   │   │   └── hitDetection.ts
│   │   │   │   ├── auth/             # Auth utilities
│   │   │   │   │   └── authOptions.ts
│   │   │   │   ├── api/              # API client
│   │   │   │   │   └── client.ts
│   │   │   │   └── utils/            # General utilities
│   │   │   │       ├── colors.ts
│   │   │   │       ├── geometry.ts
│   │   │   │       └── id.ts
│   │   │   │
│   │   │   └── types/                # TypeScript types
│   │   │       ├── canvas.ts
│   │   │       ├── objects.ts
│   │   │       ├── socket.ts
│   │   │       └── api.ts
│   │   │
│   │   ├── public/                   # Static assets
│   │   │   ├── fonts/
│   │   │   └── images/
│   │   │
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── server/                       # Express + Socket.io backend
│       ├── src/
│       │   ├── index.ts              # Entry point
│       │   ├── app.ts                # Express app setup
│       │   │
│       │   ├── routes/               # API routes
│       │   │   ├── index.ts
│       │   │   ├── boards.ts
│       │   │   └── objects.ts
│       │   │
│       │   ├── socket/               # Socket.io handlers
│       │   │   ├── index.ts
│       │   │   ├── connection.ts
│       │   │   ├── board.ts
│       │   │   ├── cursor.ts
│       │   │   ├── objects.ts
│       │   │   └── selection.ts
│       │   │
│       │   ├── services/             # Business logic
│       │   │   ├── AuthService.ts
│       │   │   ├── BoardService.ts
│       │   │   ├── ObjectService.ts
│       │   │   ├── PresenceService.ts
│       │   │   ├── SyncService.ts
│       │   │   └── AnonSessionService.ts
│       │   │
│       │   ├── repositories/         # Data access
│       │   │   ├── UserRepository.ts
│       │   │   ├── BoardRepository.ts
│       │   │   ├── ObjectRepository.ts
│       │   │   └── SessionRepository.ts
│       │   │
│       │   ├── middleware/           # Express middleware
│       │   │   ├── auth.ts
│       │   │   ├── rateLimit.ts
│       │   │   ├── cors.ts
│       │   │   ├── validate.ts
│       │   │   └── errorHandler.ts
│       │   │
│       │   ├── lib/                  # Utilities
│       │   │   ├── prisma.ts         # Prisma client
│       │   │   ├── redis.ts          # Redis client
│       │   │   └── validators/       # Zod schemas
│       │   │       ├── board.ts
│       │   │       └── object.ts
│       │   │
│       │   └── types/                # TypeScript types
│       │       ├── socket.ts
│       │       └── api.ts
│       │
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       │
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                         # Shared packages
│   ├── shared/                       # Shared code between apps
│   │   ├── src/
│   │   │   ├── types/               # Shared TypeScript types
│   │   │   │   ├── objects.ts
│   │   │   │   ├── board.ts
│   │   │   │   └── socket-events.ts
│   │   │   ├── constants/           # Shared constants
│   │   │   │   ├── colors.ts
│   │   │   │   └── defaults.ts
│   │   │   └── utils/               # Shared utilities
│   │   │       └── id.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── eslint-config/               # Shared ESLint config
│       ├── index.js
│       └── package.json
│
├── docker/                          # Docker configurations
│   ├── Dockerfile.server
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Lint, test, type-check
│       └── deploy.yml               # Deploy to Vercel/Render
│
├── .env.example
├── package.json                     # Root package.json (workspaces)
├── turbo.json                       # Turborepo config
└── README.md
```

---

## Database Schema

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// User & Authentication
// ============================================================================

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String
  avatarUrl   String?
  provider    String   // 'google'
  providerId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  boards      Board[]
  sessions    Session[]

  @@index([email])
  @@index([provider, providerId])
  @@map("users")
}

model Session {
  id          String   @id @default(uuid())
  boardId     String
  displayName String
  cursorColor String
  lastActive  DateTime @default(now())
  createdAt   DateTime @default(now())

  // Relations (anonymous sessions keep userId null)
  user        User?    @relation(fields: [userId], references: [id])
  userId      String?
  board       Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)

  @@index([boardId])
  @@map("sessions")
}

// ============================================================================
// Board & Objects
// ============================================================================

model Board {
  id          String   @id @default(uuid())
  name        String   @default("Untitled Board")
  shareLink   String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  ownerId     String
  objects     Object[]
  sessions    Session[]

  @@index([ownerId])
  @@index([shareLink])
  @@map("boards")
}

model Object {
  id          String   @id @default(uuid())
  type        String   // 'sticky' | 'rectangle' | 'circle' | 'line' | 'connector' | 'text' | 'frame'
  data        Json     // Type-specific properties
  x           Float    @default(0)
  y           Float    @default(0)
  width       Float?
  height      Float?
  rotation    Float    @default(0)
  zIndex      Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  board       Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  boardId     String

  @@index([boardId])
  @@index([boardId, type])
  @@index([boardId, zIndex])
  @@map("objects")
}
```

### Redis Data Structures

```
# Presence data for a board (expires after 5 minutes of inactivity)
presence:board:{boardId}
  └── Hash: { userId: JSON.stringify(UserPresence) }

# Cursor positions for a board (expires after 30 seconds of inactivity)
cursor:board:{boardId}
  └── Hash: { userId: JSON.stringify({ x, y, timestamp }) }

# Anonymous session data
session:anon:{sessionId}
  └── String: JSON.stringify({ displayName, cursorColor, boardId })
  └── TTL: 24 hours

# Pub/Sub channels for scaling
channel:board:{boardId}
  └── Publish: JSON.stringify(SocketEvent)
```

---

## API Specifications

Contract source of truth:
- `ARCHITECTURE.md` is canonical for REST endpoint and socket payload shapes.
- `spec.md` and `tasks.md` should mirror these contracts exactly.

### REST API Endpoints

#### Authentication (NextAuth.js on Frontend / Vercel)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/signin` | Redirect to OAuth provider | Public |
| GET | `/api/auth/callback/:provider` | OAuth callback handler | Public |
| POST | `/api/auth/signout` | Sign out current user | Authenticated |
| GET | `/api/auth/session` | Get current session | Public |

Backend APIs in `apps/server` are authenticated through session cookie
validation (`authMiddleware`) for MVP.

#### Boards

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/boards` | List user's boards | Authenticated |
| POST | `/api/boards` | Create new board | Authenticated |
| GET | `/api/boards/:id` | Get board details | Owner or Link |
| PATCH | `/api/boards/:id` | Update board (rename) | Owner |
| DELETE | `/api/boards/:id` | Delete board | Owner |
| GET | `/api/boards/share/:shareLink` | Get board by share link | Public |

#### Objects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/boards/:id/objects` | Get all objects for board | Owner or Link |
| POST | `/api/boards/:id/objects` | Create object | Owner or Link |
| PATCH | `/api/objects/:id` | Update object | Owner or Link |
| DELETE | `/api/objects/:id` | Delete object | Owner or Link |
| POST | `/api/objects/batch` | Batch operations | Owner or Link |

### WebSocket Events

#### Connection Lifecycle

```typescript
// Client → Server
'connection'                    // Socket.io automatic
'disconnect'                    // Socket.io automatic

// Server → Client
'connect'                       // Connection established
'disconnect'                    // Connection lost
'reconnect'                     // Reconnected
'error'                         // Error occurred
```

#### Board Room Management

```typescript
// Client → Server
'board:join'                    // { boardId: string, userId?: string, displayName?: string }
'board:leave'                   // { boardId: string }

// Server → Client
'board:state'                   // { objects: Object[], users: UserPresence[] }
'board:deleted'                 // { boardId: string } - Board was deleted by owner
```

#### Cursor & Presence

```typescript
// Client → Server
'cursor:move'                   // { boardId: string, x: number, y: number }

// Server → Client
'cursor:update'                 // { userId: string, x: number, y: number, displayName: string, color: string }
'user:joined'                   // { user: UserPresence }
'user:left'                     // { userId: string }
'users:list'                    // { users: UserPresence[] }
```

#### Object Operations

```typescript
// Client → Server
'object:create'                 // { boardId: string, object: ObjectData }
'object:update'                 // { boardId: string, objectId: string, changes: Partial<ObjectData>, clientTimestamp: number, clientOpId: string }
'object:delete'                 // { boardId: string, objectId: string }
'object:batch'                  // { boardId: string, operations: BatchOperation[] }

// Server → Client
'object:created'                // { object: Object, userId: string }
'object:updated'                // { objectId: string, changes: Partial<ObjectData>, userId: string, serverTimestamp: number, clientOpId?: string }
'object:deleted'                // { objectId: string, userId: string }
'object:batch'                  // { operations: BatchOperation[], userId: string }
```

#### Selection Sync

```typescript
// Client → Server
'selection:update'              // { boardId: string, objectIds: string[] }

// Server → Client
'selection:updated'             // { userId: string, objectIds: string[] }
```

---

## Security Architecture

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │  User   │      │   Next.js   │      │   OAuth     │      │  Database   │     │
│  │         │      │  (Frontend) │      │  Provider   │      │ (PostgreSQL)│     │
│  └────┬────┘      └──────┬──────┘      └──────┬──────┘      └──────┬──────┘     │
│       │                  │                    │                    │            │
│       │ Click "Sign in"  │                    │                    │            │
│       │─────────────────▶│                    │                    │            │
│       │                  │                    │                    │            │
│       │                  │ Redirect to OAuth  │                    │            │
│       │                  │───────────────────▶│                    │            │
│       │                  │                    │                    │            │
│       │                  │                    │ User authorizes    │            │
│       │                  │◀───────────────────│                    │            │
│       │                  │                    │                    │            │
│       │                  │ Callback with code │                    │            │
│       │                  │───────────────────▶│                    │            │
│       │                  │                    │                    │            │
│       │                  │ Exchange for token │                    │            │
│       │                  │◀───────────────────│                    │            │
│       │                  │                    │                    │            │
│       │                  │ Get user profile   │                    │            │
│       │                  │─────────────────────────────────────────▶            │
│       │                  │                    │                    │            │
│       │                  │ Create/update user │                    │            │
│       │                  │◀─────────────────────────────────────────            │
│       │                  │                    │                    │            │
│       │                  │ Set session cookie │                    │            │
│       │◀─────────────────│                    │                    │            │
│       │                  │                    │                    │            │
│       │ Redirect to      │                    │                    │            │
│       │ dashboard        │                    │                    │            │
│       │                  │                    │                    │            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Security Measures

| Threat | Mitigation | Implementation |
|--------|------------|----------------|
| **CSRF** | SameSite cookies + CSRF token | NextAuth.js built-in |
| **XSS** | React auto-escaping + CSP | Content-Security-Policy header |
| **SQL Injection** | Parameterized queries | Prisma ORM |
| **Session Hijacking** | Secure httpOnly cookies | NextAuth.js session config |
| **Rate Limiting** | Request throttling | Express rate-limit middleware |
| **Input Validation** | Schema validation | Zod on all endpoints |
| **Board Access Control** | Share link validation | Middleware check on board routes |
| **WebSocket Auth** | Session validation on connect | Socket.io middleware |

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' vercel.live; # Dev-friendly baseline; tighten in production
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob: avatars.githubusercontent.com lh3.googleusercontent.com;
  connect-src 'self' wss://*.onrender.com https://api.github.com https://oauth2.googleapis.com;
  frame-ancestors 'none';
```

---

## Performance Architecture

### Frontend Optimization

| Concern | Strategy | Implementation |
|---------|----------|----------------|
| **Canvas Rendering** | GPU acceleration | Konva.js with WebGL fallback |
| **Object Rendering** | Virtual rendering | Only render visible objects |
| **State Updates** | Immutable updates | Zustand with Immer |
| **Re-renders** | Memoization | React.memo, useMemo, useCallback |
| **Bundle Size** | Code splitting | Dynamic imports for canvas |
| **Initial Load** | Skeleton loading | Loading states for dashboard |

### Backend Optimization

| Concern | Strategy | Implementation |
|---------|----------|----------------|
| **Database Queries** | Indexing | Prisma indexes on board_id, type, z_index |
| **Object Queries** | Batch loading | Single query for all board objects |
| **Presence Data** | In-memory cache | Redis with 5-minute TTL |
| **Cursor Updates** | Throttling | 16ms throttle (60 FPS max) |
| **WebSocket Messages** | Batching | Batch updates in 16ms windows |
| **Connection Pool** | Prisma pool | Connection pooling for PostgreSQL |

### Scalability Considerations

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SCALABILITY ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   CURRENT (MVP)                          FUTURE (Scale)                          │
│   ─────────────                          ─────────────                           │
│                                                                                  │
│   ┌─────────────┐                        ┌─────────────┐                        │
│   │   Single    │                        │   Multiple  │                        │
│   │   Server    │                        │   Servers   │                        │
│   │  Instance   │                        │  (Auto-scale)│                       │
│   └─────────────┘                        └─────────────┘                        │
│         │                                      │                                 │
│         │                                      ▼                                 │
│         │                               ┌─────────────┐                        │
│         │                               │    Redis    │                        │
│         │                               │  Pub/Sub    │                        │
│         │                               └─────────────┘                        │
│         │                                      │                                 │
│         ▼                                      ▼                                 │
│   ┌─────────────┐                        ┌─────────────┐                        │
│   │  PostgreSQL │                        │  PostgreSQL │                        │
│   │   Single    │                        │  Read       │                        │
│   │  Instance   │                        │  Replicas   │                        │
│   └─────────────┘                        └─────────────┘                        │
│                                                                                  │
│   Target: 5+ concurrent users            Target: 50+ concurrent users           │
│   per board                              per board                               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Test Pyramid

```
                    ┌───────────────┐
                    │    E2E Tests  │
                    │   (Playwright)│
                    │   ~10 tests   │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │   Integration Tests   │
                │      (Vitest)         │
                │     ~50 tests         │
                └───────────┬───────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │            Unit Tests                 │
        │             (Vitest)                  │
        │           ~200 tests                  │
        └───────────────────────────────────────┘
```

### Coverage Targets

| Layer | Target | Focus Areas |
|-------|--------|-------------|
| **Unit Tests** | 80% | Stores, utilities, services |
| **Integration Tests** | 70% | API endpoints, socket handlers |
| **E2E Tests** | Critical paths | Auth flow, board CRUD, collaboration |

### Test Categories

| Category | Tool | Examples |
|----------|------|----------|
| **Component Tests** | Vitest + Testing Library | Toolbar, modals, panels |
| **Store Tests** | Vitest | Object store, selection store |
| **API Tests** | Vitest + Supertest | Board CRUD, object operations |
| **Socket Tests** | Vitest + Socket.io-client | Join/leave, cursor sync, object sync |
| **E2E Tests** | Playwright | Full user flows |

---

## Third-Party Integrations

### Required Services

| Service | Purpose | Provider | Cost Model |
|---------|---------|----------|------------|
| **OAuth** | Authentication | Google | Free |
| **Database** | Data storage | Render PostgreSQL | Fixed ($7/mo) |
| **Cache** | Presence, sessions | Render Redis | Fixed ($5/mo) |
| **Hosting (FE)** | Next.js hosting | Vercel | Free tier |
| **Hosting (BE)** | Node.js hosting | Render | Free tier → $7/mo |

### Optional Services (Future)

| Service | Purpose | When Needed |
|---------|---------|-------------|
| **Error Tracking** | Error monitoring | Post-launch |
| **Analytics** | User behavior | Post-launch |
| **Email** | Notifications | If board sharing notifications needed |
| **CDN** | Asset delivery | If performance issues |

---

## Development Tooling

### Required Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Node.js** | Runtime | v20.x LTS |
| **pnpm** | Package manager | Workspaces enabled |
| **Turborepo** | Monorepo build | Cached builds |
| **TypeScript** | Type safety | Strict mode |
| **ESLint** | Linting | Shared config |
| **Prettier** | Formatting | Integrated with ESLint |

### VS Code Extensions (Recommended)

| Extension | Purpose |
|-----------|---------|
| ESLint | Linting |
| Prettier | Formatting |
| Tailwind CSS IntelliSense | CSS autocomplete |
| Prisma | Schema editing |
| TypeScript Hero | Import organization |

### Debugging Setup

| Environment | Tool | Configuration |
|-------------|------|---------------|
| Frontend | Chrome DevTools | React DevTools extension |
| Backend | Node.js Inspector | --inspect flag |
| Database | Prisma Studio | npx prisma studio |
| Redis | Redis CLI | redis-cli |

---

## Deployment Architecture

### CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CI/CD PIPELINE                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐ │
│   │  Push   │────▶│  Lint   │────▶│  Test   │────▶│  Build  │────▶│ Deploy  │ │
│   │  Code   │     │         │     │         │     │         │     │         │ │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘ │
│        │               │               │               │               │        │
│        │               │               │               │               │        │
│   GitHub Actions  ESLint +        Vitest +        TypeScript      Vercel +    │
│   Triggered       Prettier        Playwright      Compilation     Render      │
│                                                                      │        │
│                                                                      ▼        │
│                                                               ┌───────────┐  │
│                                                               │  Preview  │  │
│                                                               │   URLs    │  │
│                                                               │ (PR only) │  │
│                                                               └───────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://api.collabboard.app
NEXT_PUBLIC_WS_URL=wss://api.collabboard.app
NEXTAUTH_URL=https://collabboard.app
NEXTAUTH_SECRET=<generated-secret>

# Backend (Render)
DATABASE_URL=<postgresql-connection-string>
REDIS_URL=<redis-connection-string>
NEXTAUTH_SECRET=<same-as-frontend>
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-client-secret>
```

---

## Naming Conventions

### Files & Folders

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StickyNote.tsx`, `Toolbar.tsx` |
| Hooks | camelCase with `use` prefix | `useCanvas.ts`, `useSelection.ts` |
| Stores | camelCase with `Store` suffix | `objectStore.ts`, `canvasStore.ts` |
| Utilities | camelCase | `geometry.ts`, `colors.ts` |
| Types | PascalCase | `objects.ts`, `socket.ts` |
| API Routes | kebab-case | `board-routes.ts` |

### Code

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `const StickyNote = () => {}` |
| Functions | camelCase | `const createObject = () => {}` |
| Constants | SCREAMING_SNAKE_CASE | `const MAX_OBJECTS = 2000` |
| Types/Interfaces | PascalCase | `interface ObjectData {}` |
| Enums | PascalCase | `enum ObjectType {}` |
| CSS Classes | kebab-case (Tailwind) | `bg-blue-500`, `text-center` |

### Database

| Type | Convention | Example |
|------|------------|---------|
| Tables | snake_case (plural) | `users`, `boards`, `objects` |
| Columns | snake_case | `created_at`, `board_id` |
| Indexes | `idx_<table>_<columns>` | `idx_objects_board` |
| Foreign Keys | `<table>_<column>_fkey` | `boards_owner_id_fkey` |

---

## Open Architecture Decisions

| Decision | Options | Recommendation | Status |
|----------|---------|----------------|--------|
| **SSR Strategy** | Full SSR, SSG, Hybrid | Hybrid: Dashboard SSR, Canvas CSR | ✅ Decided |
| **Monorepo Tool** | Turborepo, Nx, pnpm workspaces | Turborepo | ✅ Decided |
| **Testing Coverage** | 60%, 70%, 80% | 80% unit, 70% integration | ✅ Decided |
| **Background Jobs** | Needed? BullMQ? | Defer to future if needed | ⏳ Deferred |
| **Email Service** | SendGrid, Resend, none | None for MVP | ✅ Decided |
| **Error Tracking** | Sentry, none | Defer to post-launch | ⏳ Deferred |
| **Analytics** | Plausible, Google, none | Defer to post-launch | ⏳ Deferred |

---

## Project Change Log Process

- `CHANGELOG.md` is the canonical running history of progress and key decisions.
- Every commit should add one entry including: summary, decisions, mistakes/fixes, and lessons learned.
- If a commit had no mistakes, record `Mistakes/Lessons: none this commit`.

---

**Document Version:** 1.0  
**Last Updated:** Phase 2 Complete  
**Status:** Ready for Task Decomposition
