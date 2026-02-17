# spec.md

## Project: CollabBoard

> Production-scale collaborative whiteboard infrastructure with real-time synchronization, designed for future AI agent integration.

---

## Problem

Teams and individuals lack a high-performance, self-hosted collaborative whiteboard solution that combines sub-100ms real-time synchronization with smooth 60 FPS interactions. Existing solutions fall into two categories:

1. **Proprietary SaaS products** (Miro, FigJam, Lucidspark) — Excellent UX but limited customization, vendor lock-in, and recurring costs
2. **Open-source alternatives** — Often struggle with performance at scale (500+ objects), degrade with multiple concurrent users, and lack polish

Teams who need control over their data, customization options, or want to extend the platform (e.g., with AI capabilities) are forced to compromise on either performance, ownership, or feature completeness.

---

## Solution

Build **CollabBoard** — a production-grade collaborative whiteboard application with:

- **Infinite canvas** with smooth pan/zoom at 60 FPS
- **Rich object types**: sticky notes, shapes (rectangles, circles, lines), connectors, text elements, and frames
- **Full object manipulation**: create, edit, delete, move, resize, rotate, select (single and multi-select)
- **Real-time collaboration**: multiplayer cursors with names, instant object sync, presence awareness
- **GPU-accelerated rendering** via WebGL/Konva.js for 500+ objects without performance degradation
- **WebSocket-based synchronization** for sub-100ms object sync and sub-50ms cursor presence
- **Personal board ownership** with simple shareable links for collaboration
- **Flexible authentication**: OAuth (Google) for creators, anonymous option for collaborators
- **Extensible architecture** designed for future AI agent integration

---

## Outcome / Success Metrics

| Metric | Target | Measurement Method | Priority |
|--------|--------|-------------------|----------|
| Frame rate | 60 FPS during pan, zoom, object manipulation | Performance profiling, requestAnimationFrame timing | P0 |
| Object sync latency | <100ms | WebSocket message round-trip time (server to client) | P0 |
| Cursor sync latency | <50ms | Presence broadcast latency across connected clients | P0 |
| Object capacity | 500+ objects without performance drops | Load testing with synthetic boards | P0 |
| Concurrent users | 5+ users without degradation | Multi-user simulation tests, latency monitoring | P0 |
| Board persistence | Board state survives all users leaving | Database state verification after session end | P0 |
| Reconnection time | <3 seconds to re-establish sync | Connection drop/recovery testing | P1 |

---

## User Stories

### Authentication & Onboarding

#### US-1: Sign Up with OAuth
**As a** new user  
**I want to** sign up using my Google account  
**So that** I can quickly access the app without creating new credentials

**Acceptance Criteria:**
- [ ] "Sign in with Google" button is prominently displayed on landing page
- [ ] Successful OAuth flow redirects to user's board dashboard
- [ ] Failed OAuth flow shows clear error message with retry option
- [ ] User profile (name, email, avatar) is stored on first login
- [ ] Subsequent logins remember the user (session persistence)

#### US-2: Join Board Anonymously
**As a** collaborator with a board link  
**I want to** join a board without creating an account  
**So that** I can contribute immediately without friction

**Acceptance Criteria:**
- [ ] User clicks shared board link
- [ ] User sees option to "Join anonymously" or "Sign in"
- [ ] Choosing "Join anonymously" prompts for a display name
- [ ] Display name is required (minimum 1 character)
- [ ] Anonymous user is assigned a random cursor color
- [ ] Anonymous user can fully participate (create, edit, delete objects)
- [ ] Anonymous session persists in localStorage for return visits
- [ ] Anonymous user appears in presence list with "(Guest)" indicator

#### US-3: Join Board with Account
**As a** collaborator with a board link  
**I want to** sign in with my existing account  
**So that** my identity is properly attributed and I can access my own boards later

**Acceptance Criteria:**
- [ ] User clicks shared board link
- [ ] User sees option to "Join anonymously" or "Sign in"
- [ ] Choosing "Sign in" initiates OAuth flow (Google)
- [ ] Successful sign-in joins the board with full user identity
- [ ] User's avatar and name appear in cursor and presence list
- [ ] Board is added to user's "Shared with me" section in dashboard

---

### Board Management

#### US-4: Create New Board
**As a** logged-in user  
**I want to** create a new board  
**So that** I can start a new collaborative workspace

**Acceptance Criteria:**
- [ ] "New Board" button is prominently displayed on dashboard
- [ ] Clicking creates a new board with auto-generated unique ID
- [ ] Board is created with default settings (infinite canvas, no content)
- [ ] User is immediately navigated to the new board
- [ ] Board appears in user's "My Boards" list
- [ ] Default board name is "Untitled Board" (editable)

#### US-5: View My Boards
**As a** logged-in user  
**I want to** see a list of boards I've created  
**So that** I can quickly access my workspaces

**Acceptance Criteria:**
- [ ] Dashboard displays "My Boards" section
- [ ] Each board shows: thumbnail preview, name, last modified date
- [ ] Boards are sorted by last modified (most recent first)
- [ ] Clicking a board navigates to that board
- [ ] Hovering shows quick actions: rename, share, delete

#### US-6: View Shared Boards
**As a** logged-in user  
**I want to** see boards that have been shared with me  
**So that** I can revisit collaborative work

**Acceptance Criteria:**
- [ ] Dashboard displays "Shared with me" section (if any boards exist)
- [ ] Each board shows: owner name, board name, last modified date
- [ ] Boards are sorted by last modified (most recent first)
- [ ] Clicking a board navigates to that board

#### US-7: Share Board
**As a** board owner  
**I want to** generate a shareable link  
**So that** I can invite others to collaborate

**Acceptance Criteria:**
- [ ] "Share" button is visible in board toolbar
- [ ] Clicking opens share modal
- [ ] Modal displays the board's shareable link
- [ ] "Copy link" button copies URL to clipboard
- [ ] Success toast confirms link was copied
- [ ] Anyone with link has full edit access (no permission levels for MVP)

#### US-8: Delete Board
**As a** board owner  
**I want to** delete a board I own  
**So that** I can remove unwanted workspaces

**Acceptance Criteria:**
- [ ] Delete option appears in board's context menu (dashboard hover)
- [ ] Confirmation dialog prevents accidental deletion
- [ ] Confirmation shows: "Delete '[Board Name]'? This cannot be undone."
- [ ] Deleted board is removed from "My Boards" list
- [ ] All board data (objects, metadata) is permanently removed
- [ ] Active collaborators are disconnected and see "Board not found" message

---

### Canvas & Navigation

#### US-9: Pan Canvas
**As a** user  
**I want to** pan across the infinite canvas  
**So that** I can navigate to different areas of my workspace

**Acceptance Criteria:**
- [ ] Click and drag on empty canvas space pans the viewport
- [ ] Pan operation maintains 60 FPS performance
- [ ] Touchpad two-finger drag pans on supported devices
- [ ] Mouse wheel (with no modifier) pans vertically
- [ ] Shift + wheel pans horizontally
- [ ] Pan continues smoothly past visible objects (infinite canvas)
- [ ] Canvas coordinates update in real-time during pan
- [ ] Current viewport position is synced to other users (optional: show other users' viewports)

#### US-10: Zoom Canvas
**As a** user  
**I want to** zoom in and out on the canvas  
**So that** I can work at different scales

**Acceptance Criteria:**
- [ ] Mouse wheel zooms centered on cursor position
- [ ] Touchpad pinch gesture zooms on supported devices
- [ ] Zoom controls (+/-) available in UI corner
- [ ] Zoom range: 10% to 400% (0.1x to 4x)
- [ ] Zoom operation maintains 60 FPS performance
- [ ] Zoom level indicator shows current zoom percentage
- [ ] "Fit to content" option zooms to show all objects
- [ ] "Reset zoom" option returns to 100%

#### US-11: View Grid
**As a** user  
**I want to** see an optional grid on the canvas  
**So that** I can align objects precisely

**Acceptance Criteria:**
- [ ] Grid toggle button in toolbar
- [ ] Grid visible when enabled (default: on)
- [ ] Grid spacing: 20px at 100% zoom (scales with zoom)
- [ ] Grid is visual only (does not snap objects automatically)
- [ ] Grid preference persists per board

---

### Object Creation

#### US-12: Create Sticky Note
**As a** user  
**I want to** create a sticky note on the canvas  
**So that** I can capture and organize text-based ideas

**Acceptance Criteria:**
- [ ] Sticky note tool available in left panel or toolbar
- [ ] Click on canvas creates sticky note at that position
- [ ] Default size: 200x200px
- [ ] Default color: yellow (#FFE66D)
- [ ] New sticky note has placeholder text: "Double-click to edit"
- [ ] Sticky note is immediately selected after creation
- [ ] Double-click enters text edit mode
- [ ] Text wraps within sticky note bounds
- [ ] Color picker available in properties panel to change color
- [ ] Predefined color palette: yellow, pink, blue, green, orange, purple

#### US-13: Create Rectangle
**As a** user  
**I want to** create a rectangle shape on the canvas  
**So that** I can create visual containers and boundaries

**Acceptance Criteria:**
- [ ] Rectangle tool available in left panel or toolbar
- [ ] Click and drag on canvas creates rectangle
- [ ] Rectangle drawn from corner to corner during creation
- [ ] Shift key constrains to square during creation
- [ ] Default fill color: light gray (#E5E5E5)
- [ ] Default stroke: none
- [ ] Fill and stroke colors configurable in properties panel
- [ ] Stroke width configurable (1-10px)
- [ ] Minimum size: 10x10px

#### US-14: Create Circle/Ellipse
**As a** user  
**I want to** create a circle or ellipse on the canvas  
**So that** I can create rounded visual elements

**Acceptance Criteria:**
- [ ] Ellipse tool available in left panel or toolbar
- [ ] Click and drag on canvas creates ellipse
- [ ] Ellipse drawn within bounding box during creation
- [ ] Shift key constrains to perfect circle during creation
- [ ] Default fill color: light blue (#B5D8EB)
- [ ] Default stroke: none
- [ ] Fill and stroke colors configurable in properties panel
- [ ] Stroke width configurable (1-10px)
- [ ] Minimum size: 10x10px

#### US-15: Create Line
**As a** user  
**I want to** create a line on the canvas  
**So that** I can connect or separate elements visually

**Acceptance Criteria:**
- [ ] Line tool available in left panel or toolbar
- [ ] Click and drag creates a line from start to end point
- [ ] Shift key constrains to horizontal, vertical, or 45° angle
- [ ] Default stroke color: dark gray (#333333)
- [ ] Default stroke width: 2px
- [ ] Stroke color and width configurable in properties panel
- [ ] Minimum length: 5px

#### US-16: Create Connector
**As a** user  
**I want to** connect objects with lines or arrows  
**So that** I can show relationships between elements

**Acceptance Criteria:**
- [ ] Connector tool available in left panel or toolbar
- [ ] Click on object starts connector (shows attachment point)
- [ ] Click on another object completes connector
- [ ] Connector attaches to nearest edge/corner of each object
- [ ] Default style: straight line with arrow at end
- [ ] Arrow style configurable: none, arrow, diamond
- [ ] Connector re-routes when objects are moved
- [ ] Line style configurable: straight, curved (bezier)
- [ ] Stroke color and width configurable
- [ ] Detached connectors (one end on canvas, not object) are supported

#### US-17: Create Text Element
**As a** user  
**I want to** create standalone text on the canvas  
**So that** I can add labels, titles, or annotations

**Acceptance Criteria:**
- [ ] Text tool available in left panel or toolbar
- [ ] Click on canvas creates text element at that position
- [ ] Text element is empty, immediately in edit mode
- [ ] Default font: System UI, 16px, black
- [ ] Font family, size, and color configurable in properties panel
- [ ] Text element grows horizontally as user types
- [ ] Enter key creates new line (text grows vertically)
- [ ] Click outside or Escape exits edit mode
- [ ] Text element auto-sizes to content (no manual resize for MVP)

#### US-18: Create Frame
**As a** user  
**I want to** create a frame (named region) on the canvas  
**So that** I can group and organize content areas

**Acceptance Criteria:**
- [ ] Frame tool available in left panel or toolbar
- [ ] Click and drag creates a rectangular frame
- [ ] Frame has a title bar at the top
- [ ] Title is editable by double-clicking
- [ ] Default title: "Frame"
- [ ] Frame has visible border (dashed or solid)
- [ ] Frame background is semi-transparent or transparent
- [ ] Objects can be placed inside frame
- [ ] Moving frame moves all contained objects
- [ ] Frame can be named/colored for organization
- [ ] Frames appear in a minimap or outline view (future)

---

### Object Selection & Manipulation

#### US-19: Select Single Object
**As a** user  
**I want to** select a single object on the canvas  
**So that** I can manipulate it

**Acceptance Criteria:**
- [ ] Click on object selects it
- [ ] Selection indicated by bounding box with resize handles
- [ ] Previously selected object is deselected
- [ ] Click on empty canvas deselects all
- [ ] Selection is synced to all collaborators (shows their selections)
- [ ] Selected object's properties appear in right panel

#### US-20: Select Multiple Objects
**As a** user  
**I want to** select multiple objects at once  
**So that** I can manipulate them together

**Acceptance Criteria:**
- [ ] Shift+click adds object to selection
- [ ] Shift+click on selected object removes it from selection
- [ ] Drag on empty canvas creates selection rectangle (marquee select)
- [ ] All objects within selection rectangle are selected
- [ ] Multi-selection shows combined bounding box
- [ ] All selected objects can be moved together
- [ ] Ctrl/Cmd+A selects all objects on board

#### US-21: Move Object
**As a** user  
**I want to** move objects on the canvas  
**So that** I can reposition them

**Acceptance Criteria:**
- [ ] Click and drag on selected object moves it
- [ ] Movement is smooth (60 FPS)
- [ ] Arrow keys move selected object(s) by 1px
- [ ] Shift+arrow keys move by 10px
- [ ] Object position syncs to collaborators in real-time
- [ ] Movement respects any frame containment (if frame is parent)

#### US-22: Resize Object
**As a** user  
**I want to** resize objects on the canvas  
**So that** I can adjust their dimensions

**Acceptance Criteria:**
- [ ] Drag corner handles resize proportionally (corner to corner)
- [ ] Drag edge handles resize in one dimension only
- [ ] Shift key maintains aspect ratio during corner resize
- [ ] Minimum size constraints enforced (varies by object type)
- [ ] Resize operation maintains 60 FPS
- [ ] Resize syncs to collaborators in real-time

#### US-23: Rotate Object
**As a** user  
**I want to** rotate objects on the canvas  
**So that** I can orient them as needed

**Acceptance Criteria:**
- [ ] Rotation handle appears above selected object
- [ ] Drag rotation handle rotates object around center
- [ ] Shift key constrains rotation to 15° increments
- [ ] Rotation indicator shows current angle
- [ ] Rotation syncs to collaborators in real-time
- [ ] Text within rotated objects remains readable (counter-rotate or not, per object type)

#### US-24: Edit Object Properties
**As a** user  
**I want to** edit properties of selected objects  
**So that** I can customize their appearance

**Acceptance Criteria:**
- [ ] Properties panel shows relevant properties for selected object type
- [ ] Common properties: position (x, y), size (width, height), rotation
- [ ] Shape properties: fill color, stroke color, stroke width, opacity
- [ ] Text properties: font family, font size, font weight, text color, alignment
- [ ] Sticky note properties: background color, text content
- [ ] Changes apply immediately to selection
- [ ] Changes sync to collaborators in real-time
- [ ] Properties panel is collapsible

#### US-25: Delete Objects
**As a** user  
**I want to** delete selected objects  
**So that** I can remove unwanted elements

**Acceptance Criteria:**
- [ ] Delete key removes selected object(s)
- [ ] Backspace key also removes selected object(s)
- [ ] Right-click menu includes "Delete" option
- [ ] Deletion syncs to collaborators immediately
- [ ] Connectors attached to deleted objects are also deleted
- [ ] Objects inside deleted frames remain on canvas (frame removed, content preserved)

#### US-26: Duplicate Objects
**As a** user  
**I want to** duplicate selected objects  
**So that** I can quickly create copies

**Acceptance Criteria:**
- [ ] Ctrl/Cmd+D duplicates selected object(s)
- [ ] Duplicated objects appear offset from originals (20px right, 20px down)
- [ ] Duplicates are automatically selected
- [ ] Duplication syncs to collaborators immediately
- [ ] Connectors between duplicated objects are also duplicated

#### US-27: Copy and Paste Objects
**As a** user  
**I want to** copy and paste objects  
**So that** I can replicate elements within or across boards

**Acceptance Criteria:**
- [ ] Ctrl/Cmd+C copies selected object(s) to clipboard
- [ ] Ctrl/Cmd+V pastes at cursor position or offset from original
- [ ] Paste works within the same board
- [ ] Cross-board paste works when both boards are open (same session)
- [ ] Pasted objects are automatically selected
- [ ] Copy/paste syncs via internal clipboard (not system clipboard for MVP)

---

### Real-Time Collaboration

#### US-28: See Other Users' Cursors
**As a** user  
**I want to** see other collaborators' cursors on the canvas  
**So that** I know where others are working

**Acceptance Criteria:**
- [ ] Each collaborator has a uniquely colored cursor
- [ ] Cursor displays collaborator's name next to it
- [ ] Cursor movement is smooth (<50ms latency)
- [ ] Cursor fades to dim when user is inactive (>5 seconds)
- [ ] Cursor disappears when user leaves the board
- [ ] Anonymous users show assigned display name with "(Guest)" indicator
- [ ] Cursor colors are distinct (no two users have same color in a session)

#### US-29: See Object Modifications in Real-Time
**As a** user  
**I want to** see other collaborators' changes immediately  
**So that** we can work together effectively

**Acceptance Criteria:**
- [ ] Object creation by others appears on my canvas within 100ms
- [ ] Object modifications (move, resize, rotate) sync within 100ms
- [ ] Object deletions sync within 100ms
- [ ] No visible "jumps" — changes are smooth and continuous
- [ ] Optimistic updates: my own changes appear instantly (no round-trip wait)
- [ ] If sync fails, user is notified and can retry

#### US-30: See User Presence
**As a** user  
**I want to** see who is currently on the board  
**So that** I know who I'm collaborating with

**Acceptance Criteria:**
- [ ] Presence indicator shows list of all active collaborators
- [ ] Each user shows: avatar (or colored circle for anonymous), name
- [ ] Presence indicator is visible but not intrusive (collapsible)
- [ ] Users who leave are removed from the list
- [ ] User count displayed (e.g., "3 active")

#### US-31: Handle Connection Issues
**As a** user  
**I want to** be informed of connection issues and have the app recover  
**So that** I don't lose my work

**Acceptance Criteria:**
- [ ] Connection status indicator visible (connected, reconnecting, offline)
- [ ] "Reconnecting..." overlay appears if connection drops
- [ ] Local changes queue while disconnected
- [ ] Automatic reconnection attempted (exponential backoff)
- [ ] On reconnect, queued changes are synced
- [ ] If reconnection fails after 30 seconds, user is offered to save locally or reload
- [ ] Full board state is re-synced on reconnect to ensure consistency

#### US-32: Handle Simultaneous Edits
**As a** user  
**I want to** have predictable behavior when editing the same object as another user  
**So that** work isn't lost unexpectedly

**Acceptance Criteria:**
- [ ] Last-write-wins conflict resolution (documented and acceptable)
- [ ] If two users edit same property of same object, last update wins
- [ ] Users see each other's selections, reducing accidental conflicts
- [ ] Conflict resolution strategy is documented in technical docs

---

### UI/UX

#### US-33: Use Toolbar
**As a** user  
**I want to** access common tools from a toolbar  
**So that** I can quickly switch between modes

**Acceptance Criteria:**
- [ ] Toolbar is positioned at the top of the screen
- [ ] Toolbar includes: selection tool, text tool, shape tools, sticky note, connector, frame
- [ ] Active tool is visually highlighted
- [ ] Keyboard shortcuts available for all tools (V=select, T=text, R=rectangle, etc.)
- [ ] Tooltips show tool name and shortcut on hover
- [ ] Toolbar can be collapsed/minimized to maximize canvas space

#### US-34: Use Left Panel (Object Library)
**As a** user  
**I want to** access shapes and objects from a left panel  
**So that** I can browse and create elements

**Acceptance Criteria:**
- [ ] Left panel is collapsible (toggle button or drag)
- [ ] Panel contains shape library: rectangles, circles, lines, arrows
- [ ] Panel contains sticky note option
- [ ] Panel contains text option
- [ ] Panel contains frame option
- [ ] Dragging from panel to canvas creates object at drop position
- [ ] Panel remembers collapsed/expanded state

#### US-35: Use Right Panel (Properties)
**As a** user  
**I want to** view and edit properties in a right panel  
**So that** I can customize selected objects

**Acceptance Criteria:**
- [ ] Right panel is collapsible (toggle button or drag)
- [ ] Panel shows properties of selected object(s)
- [ ] Panel shows "No selection" when nothing is selected
- [ ] Panel updates immediately as selection changes
- [ ] Panel reserved for future AI chat integration (tabbed interface)
- [ ] Panel remembers collapsed/expanded state

#### US-36: Keyboard Shortcuts
**As a** user  
**I want to** use keyboard shortcuts for common actions  
**So that** I can work efficiently

**Acceptance Criteria:**
- [ ] V: Selection tool
- [ ] T: Text tool
- [ ] R: Rectangle tool
- [ ] O: Circle/Ellipse tool
- [ ] L: Line tool
- [ ] C: Connector tool
- [ ] S: Sticky note tool
- [ ] F: Frame tool
- [ ] Delete/Backspace: Delete selected
- [ ] Ctrl/Cmd+D: Duplicate
- [ ] Ctrl/Cmd+C: Copy
- [ ] Ctrl/Cmd+V: Paste
- [ ] Ctrl/Cmd+A: Select all
- [ ] Ctrl/Cmd+Z: Undo
- [ ] Ctrl/Cmd+Shift+Z: Redo
- [ ] Space (hold): Pan mode (temporary)
- [ ] Shortcuts documented in help/tooltip

#### US-37: Undo/Redo
**As a** user  
**I want to** undo and redo my actions  
**So that** I can recover from mistakes

**Acceptance Criteria:**
- [ ] Ctrl/Cmd+Z undoes last action
- [ ] Ctrl/Cmd+Shift+Z redoes last undone action
- [ ] Undo stack is per-user (my undo doesn't undo others' actions)
- [ ] Undo stack limited to 50 actions
- [ ] Undo/redo works for: create, delete, move, resize, rotate, property changes
- [ ] Undo/redo does not work across sessions (cleared on page reload)

---

## Tech Stack

### Frontend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 15 (App Router) | React ecosystem, SSR/SSG, excellent DX, Vercel integration |
| Rendering Engine | Konva.js + react-konva | GPU-accelerated Canvas, object model, React integration, 60 FPS capable |
| State Management | Zustand | Lightweight, minimal boilerplate, good for real-time updates |
| Styling | Tailwind CSS | Rapid prototyping, consistent design system, small bundle |
| Authentication | NextAuth.js (Auth.js) | OAuth providers, session management, React integration |
| Real-Time Client | Socket.io-client | WebSocket abstraction, auto-reconnect, fallback support |

### Backend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| API Server | Node.js + Express | Lightweight, WebSocket-friendly, same language as frontend |
| Real-Time Server | Socket.io | Proven WebSocket library, rooms, broadcasting, reconnection |
| Database | PostgreSQL | Relational data, JSONB for object storage, reliable, scalable |
| ORM | Prisma | Type-safe, migrations, excellent DX, PostgreSQL support |
| Cache/Pub-Sub | Redis | Presence data, pub-sub for scaling, session caching |

### Infrastructure

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend Hosting | Vercel | Next.js optimization, CDN, preview deployments, DX |
| Backend Hosting | Render | Native WebSocket support, managed PostgreSQL/Redis, existing account |
| CI/CD | GitHub Actions | Test, lint, build, deploy automation |

### Development Tools

| Tool | Purpose |
|------|---------|
| TypeScript | Type safety across frontend and backend |
| ESLint | Code quality, consistency |
| Prettier | Code formatting |
| Vitest | Unit tests |
| Playwright | E2E tests |
| Storybook | Component development (optional) |

---

## Data Model

### Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Board    │       │   Object    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │──┐    │ id          │──┐    │ id          │
│ email       │  │    │ owner_id    │  │    │ board_id    │
│ name        │  └───▶│ name        │  └───▶│ type        │
│ avatar_url  │       │ share_link  │       │ data (JSON) │
│ provider    │       │ created_at  │       │ position    │
│ created_at  │       │ updated_at  │       │ z_index     │
└─────────────┘       └─────────────┘       └─────────────┘
```

### Schema Definition

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  provider VARCHAR(50) NOT NULL, -- 'google'
  provider_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

#### Boards Table

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) DEFAULT 'Untitled Board',
  share_link VARCHAR(255) UNIQUE NOT NULL, -- unique public identifier
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_boards_owner ON boards(owner_id);
CREATE INDEX idx_boards_share_link ON boards(share_link);
```

#### Objects Table

```sql
CREATE TABLE objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'sticky' | 'rectangle' | 'circle' | 'line' | 'connector' | 'text' | 'frame'
  data JSONB NOT NULL, -- type-specific properties
  x FLOAT NOT NULL DEFAULT 0,
  y FLOAT NOT NULL DEFAULT 0,
  width FLOAT,
  height FLOAT,
  rotation FLOAT DEFAULT 0,
  z_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_objects_board ON objects(board_id);
CREATE INDEX idx_objects_type ON objects(board_id, type);
CREATE INDEX idx_objects_z_index ON objects(board_id, z_index);
```

#### Object Data Schema (JSONB)

Each object type stores type-specific data in the `data` JSONB column:

```typescript
// Sticky Note
interface StickyNoteData {
  text: string;
  color: string; // hex color
  fontSize?: number;
}

// Rectangle / Circle
interface ShapeData {
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  opacity: number;
}

// Line
interface LineData {
  stroke: string;
  strokeWidth: number;
  points: number[]; // [x1, y1, x2, y2] or more for polylines
}

// Connector
interface ConnectorData {
  startObjectId: string | null;
  endObjectId: string | null;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  stroke: string;
  strokeWidth: number;
  arrowStyle: 'none' | 'arrow' | 'diamond';
  lineStyle: 'straight' | 'curved';
}

// Text
interface TextData {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

// Frame
interface FrameData {
  title: string;
  color: string; // border/accent color
  childIds: string[]; // IDs of objects inside frame
}
```

#### Sessions Table (board presence sessions)

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- null for anonymous collaborators
  display_name VARCHAR(255) NOT NULL,
  cursor_color VARCHAR(7) NOT NULL,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_board ON sessions(board_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
```

---

## API Contracts

Contract source of truth:
- `ARCHITECTURE.md` is canonical for REST endpoint and socket payload shapes.
- This spec captures product intent and mirrors architecture-level contracts.

### REST API Endpoints

#### Authentication

```
GET  /api/auth/signin          # Redirect to OAuth provider
GET  /api/auth/callback/:provider  # OAuth callback
POST /api/auth/signout         # Sign out current user
GET  /api/auth/session         # Get current session info
```

Backend APIs in `apps/server` use session cookie validation for MVP
(no bearer token requirement).

#### Boards

```
GET    /api/boards                    # List user's boards
POST   /api/boards                    # Create new board
GET    /api/boards/:id                # Get board details
PATCH  /api/boards/:id                # Update board (rename)
DELETE /api/boards/:id                # Delete board
GET    /api/boards/:id/objects        # Get all objects for board
GET    /api/boards/share/:shareLink   # Get board by share link (public)
```

#### Objects

```
POST   /api/boards/:id/objects        # Create object
PATCH  /api/objects/:id               # Update object
DELETE /api/objects/:id               # Delete object
POST   /api/objects/batch             # Batch create/update/delete
```

### WebSocket Events

#### Client → Server

```typescript
// Join a board room
emit('board:join', { boardId: string, userId?: string, displayName?: string })

// Leave a board room
emit('board:leave', { boardId: string })

// Cursor movement
emit('cursor:move', { boardId: string, x: number, y: number })

// Object operations
emit('object:create', { boardId: string, object: ObjectData })
emit('object:update', { boardId: string, objectId: string, changes: Partial<ObjectData>, clientTimestamp: number, clientOpId: string })
emit('object:delete', { boardId: string, objectId: string })
emit('object:batch', { boardId: string, operations: BatchOperation[] })

// Selection broadcast (show other users what you're selecting)
emit('selection:update', { boardId: string, objectIds: string[] })

// Undo/Redo
emit('undo', { boardId: string })
emit('redo', { boardId: string })
```

#### Server → Client

```typescript
// Board state on join
on('board:state', { objects: Object[], users: UserPresence[] })

// User presence
on('user:joined', { user: UserPresence })
on('user:left', { userId: string })
on('users:list', { users: UserPresence[] })

// Cursor updates
on('cursor:update', { userId: string, x: number, y: number, displayName: string, color: string })

// Object operations (from other users)
on('object:created', { object: Object, userId: string })
on('object:updated', { objectId: string, changes: Partial<ObjectData>, userId: string, serverTimestamp: number, clientOpId?: string })
on('object:deleted', { objectId: string, userId: string })
on('object:batch', { operations: BatchOperation[], userId: string })

// Selection updates
on('selection:updated', { userId: string, objectIds: string[] })

// Connection status
on('connect', {})
on('disconnect', {})
on('reconnect', {})
on('error', { message: string })
```

#### Types

```typescript
interface UserPresence {
  id: string;
  displayName: string;
  color: string;
  isAnonymous: boolean;
  cursor?: { x: number; y: number };
  selection?: string[];
  lastActive: Date;
}

interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  objectId?: string;
  object?: ObjectData;
  changes?: Partial<ObjectData>;
}
```

---

## Non-Functional Requirements

### Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Initial page load | <3s on 3G | Lighthouse, WebPageTest |
| Time to interactive | <5s | Lighthouse |
| Canvas render | 60 FPS | requestAnimationFrame timing |
| Object sync latency | <100ms (p95) | WebSocket RTT measurement |
| Cursor sync latency | <50ms (p95) | Presence broadcast timing |
| Object capacity | 500+ objects | Load testing with synthetic data |
| Concurrent users | 5+ per board | Load testing with simulated clients |
| API response time | <200ms (p95) | Server-side metrics |

### Scalability

| Requirement | Target |
|-------------|--------|
| Max boards per user | Unlimited (practical limit: 10,000) |
| Max objects per board | 2,000 (soft limit, warn above) |
| Max concurrent users per board | 20 (soft limit for performance) |
| Database connections | Connection pooling via Prisma |

### Reliability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% (managed by Render/Vercel) |
| Data durability | PostgreSQL with automated backups |
| Reconnection | Automatic with exponential backoff (max 30s) |
| Graceful degradation | Offline indicator, queued operations |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | OAuth 2.0 via Google |
| Session management | Secure httpOnly cookies (NextAuth session/JWT strategy) |
| CSRF protection | Built into NextAuth.js |
| Input validation | Zod schemas on all API endpoints |
| SQL injection | Parameterized queries via Prisma |
| XSS prevention | React auto-escaping, CSP headers |
| Rate limiting | 100 requests/minute per user |
| Board access | Valid share link required for non-owners |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All tools and actions keyboard-accessible |
| Screen reader | ARIA labels on interactive elements |
| Color contrast | WCAG 2.1 AA minimum |
| Focus indicators | Visible focus states on all interactive elements |
| Zoom support | UI usable at 200% browser zoom |

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| Mobile Safari | iOS 15+ |
| Mobile Chrome | Android 10+ |

---

## Open Questions

| # | Question | Status | Notes |
|---|----------|--------|-------|
| 1 | Should boards have a thumbnail preview for the dashboard? | **Deferred** | Nice-to-have; can generate from canvas snapshot |
| 2 | Should we support board templates? | **Out of scope** | Future feature |
| 3 | Should there be a board size/export feature? | **Out of scope** | Future feature |
| 4 | What is the undo/redo scope for collaborative editing? | **Resolved** | Per-user undo stack, not global |
| 5 | How to handle very large boards (10,000+ objects)? | **Deferred** | Virtualization/windowing in future version |
| 6 | Should anonymous users have a "claim board" option? | **Deferred** | Future feature for conversion |

---

## Future Considerations (Out of Scope for MVP)

These items are explicitly out of scope but documented for future phases:

1. **AI Agent Integration**
   - Natural language commands to manipulate board
   - AI-powered suggestions and auto-arrange
   - Chat interface in right panel

2. **Advanced Collaboration**
   - Comment threads on objects
   - Voting and reactions
   - Timer and facilitation tools
   - Follow mode (follow another user's viewport)

3. **Board Organization**
   - Folders or collections
   - Tags and search
   - Templates

4. **Export & Integrations**
   - Export to PNG, SVG, PDF
   - Embed in Notion, Confluence
   - Integrations (Slack, etc.)

5. **Enterprise Features**
   - SSO/SAML
   - Organization workspaces
   - Role-based permissions
   - Audit logs

---

## Project Change Log Process

- `CHANGELOG.md` is the canonical running history of delivery.
- Every commit should add one entry with progress, key decisions, mistakes/fixes, and lessons learned.
- If no mistakes occurred in a commit, record `Mistakes/Lessons: none this commit`.

---

## Appendix: Conflict Resolution Strategy

### Last-Write-Wins (LWW)

For MVP, we implement a last-write-wins strategy for conflict resolution:

1. **Timestamp-based**: Each object update includes a client timestamp
2. **Server authority**: Server timestamp takes precedence
3. **Property-level**: Conflicts resolved at the property level, not object level
4. **Optimistic updates**: Client applies changes immediately, reconciles on server response

### Example Scenario

```
User A moves object X to position (100, 100) at t=1
User B moves object X to position (200, 200) at t=1.1
Server receives A's update at t=1.05
Server receives B's update at t=1.15

Result: Object X is at (200, 200) — B's update wins
```

### Mitigation Strategies

1. **Selection visibility**: Users see each other's selections, reducing accidental conflicts
2. **Presence awareness**: Users can see where others are working
3. **Rapid sync**: Sub-100ms sync reduces the conflict window
4. **Future**: Operational transforms (OT) or CRDTs for stronger guarantees

---

**Document Version:** 1.0  
**Last Updated:** Phase 1 Complete  
**Status:** Ready for Review
