# Team Workflow Board + Design System

A modern, accessible, and robust React + TypeScript application for managing team workflows, built for the **Ever Quint** interview assignment.

Includes a comprehensive custom **Design System component library**, multi-column Kanban board, URL-persisted search & multi-select filtering, versioned schema persistence with automated migrations, and client-side validation with dirty state handling.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm 9+

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Running Automated Tests
```bash
# Run unit & integration test suite once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

### 4. Production Build
```bash
npm run build
```

---

## 🌟 Key Features

### 1. Board View (Backlog, In Progress, Done)
- **Columns:** Visual grouping across **Backlog**, **In Progress**, and **Done** with dynamic task counts.
- **Task Cards:** Display title, priority badge, tags, assignee avatar, and human-friendly relative timestamps (e.g., *"updated 2h ago"*).
- **Movement:** Dual support for **HTML5 Drag-and-Drop** between columns and keyboard-accessible **Quick Move arrow buttons (`←` / `→`)** and status actions.

### 2. Design System Component Library (`src/components/ui/`)
Built from scratch without third-party UI kits:
- **`Button`:** Variants (`primary`, `secondary`, `destructive`, `ghost`, `outline`) and sizes (`sm`, `md`, `lg`) with spinner loading states.
- **`TextInput` & `TextArea`:** Accessible form controls with label association, helper text, and real-time validation error messaging (`aria-invalid`, `role="alert"`).
- **`Select`:** Accessible dropdown with custom styling and chevron indicator.
- **`Badge` / `Tag`:** Priority, status, and tag pills with optional dismiss/remove action.
- **`Card`:** Composable card primitive (`CardHeader`, `CardTitle`, `CardContent`, `CardFooter`).
- **`Modal`:** WCAG-compliant dialog with focus trap, `Escape` key listener, `aria-modal="true"`, and automatic focus restoration.
- **`Toast` / `ToastProvider`:** Ephemeral toast notifications with auto-dismiss and accessibility announcements (`role="status"`).
- **`ConfirmDialog`:** Specialized modal for delete operations and unsaved change warnings.
- **`Alert`:** Inline contextual alert banners for storage warnings and info states.

### 3. Task Creation & Editing
- Full create & edit modal dialogs.
- **Client-Side Validation:** Validates required titles (3–100 characters), description length limits, and prevents duplicate tags.
- **"Dirty" State Warning:** If a user edits a task and attempts to close or navigate away, an accessible confirmation dialog warns them: *"You have unsaved changes. Discard changes or keep editing?"*

### 4. Filtering, Sorting & URL Query Synchronization
- **Multi-select Status Filter:** Toggle pills allowing selection of single or multiple statuses (e.g. Backlog + In Progress).
- **Priority Filter:** Filter by All, High, Medium, or Low.
- **Full Text Search:** Instant client-side search across task titles, descriptions, assignees, and `#tags`.
- **Sorting:** Sort by Created Date (Newest/Oldest), Recently Updated, Priority (High to Low), and Title (A–Z).
- **URL Synchronization:** Filters and sort options automatically synchronize with `window.location.search` (e.g., `?search=modal&status=backlog,in-progress&priority=high&sort=updated_desc`), enabling bookmarking, sharing, and state restoration on page refresh.

### 5. Versioned Persistence & Automated Migration
- Stored in browser `localStorage`.
- **Schema v2:** Versioned container (`{ schemaVersion: 2, tasks: [...], lastMigratedAt: ... }`).
- **Automated Migration:** When legacy Schema v1 data is detected (such as old `status: "todo"` or unversioned arrays), it transforms tasks:
  - Maps `"todo"` $\rightarrow$ `"backlog"`
  - Ensures normalized `tags: string[]`
  - Populates `updatedAt` timestamps
  - Updates schema to v2
- **Notification:** Fires a toast notification when migration completes.
- **Interactive Simulation:** Includes a *"Simulate v1 Data & Migration"* button in the workspace banner for testing the migration lifecycle on demand.

### 6. Empty & Error States
- **No Tasks Yet:** Friendly onboarding card with "+ Create First Task" and "Load Sample Tasks" actions.
- **No Filter Matches:** Empty search state with a "Reset All Filters" CTA.
- **Storage Unavailable:** Graceful fallback with error alerts if `localStorage` quota is exceeded or disabled.

---

## 🏛 Architecture Overview

```
src/
├── components/
│   ├── ui/                    # Standalone Design System
│   │   ├── Button.tsx
│   │   ├── TextInput.tsx
│   │   ├── TextArea.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── ToastContext.tsx
│   │   ├── Alert.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── index.ts
│   ├── Board.tsx              # Kanban column container with DnD
│   ├── Taskcard.tsx           # Task card with relative time & actions
│   ├── Taskform.tsx           # Form with validation & dirty check
│   ├── Taskdetails.tsx        # Details dialog with quick status switcher
│   └── Filterbar.tsx          # Multi-select status, search, and sort controls
├── hooks/
│   ├── useTasks.ts            # State, CRUD, and migration orchestration
│   └── useTaskFilters.ts      # Filter state & URL query synchronization
├── types/
│   └── task.ts                # Strict TypeScript domain models
├── utils/
│   ├── date.ts                # Relative time formatter
│   └── storageMigration.ts    # Schema versioning, v1->v2 migration & seeds
└── test/
    ├── setup.ts               # Testing environment configuration
    └── WorkflowAndFeatures.test.tsx # Core workflow & interaction tests
```

### Rationale for Architectural Decisions
1. **Custom Hooks over Global Store:** The application scope is focused and local. Custom hooks (`useTasks`, `useTaskFilters`) provide clean separation of concerns, testability, and zero boilerplate without introducing heavy external dependencies like Redux or Zustand.
2. **Composition over Props Explosion:** The Design System uses modular subcomponents (e.g., `Card`, `Modal`, `ConfirmDialog`) and standard HTML attribute forwarding (`forwardRef`), making components flexible and composable.
3. **URL as Source of Truth for Filters:** Syncing filter state with `URLSearchParams` ensures users can share links and refresh without losing their workspace view.

---

## 🧪 Testing Summary

Automated tests cover all core features using **Vitest** + **React Testing Library** + **JSDOM**:
- **Design System Unit Tests:** `ButtonAndModal.test.tsx` (component variants, sizes, keyboard escape listener, ARIA attributes).
- **Storage Migration Tests:** `storageMigration.test.ts` (v1 legacy detection, `todo` $\rightarrow$ `backlog` transformation, schema upgrade).
- **URL Synchronization Tests:** `useTaskFilters.test.ts` (query string parsing and serialization).
- **End-to-End Workflow Tests:** `WorkflowAndFeatures.test.tsx`
  - Core Workflow: Create task with title, description, tags, assignee, and verify it appears on the board.
  - Non-trivial Filter Behavior: Search filter + multi-select status pills + URL persistence.
  - Column Movement: Transitioning task from Backlog to In Progress and verifying column counts.
  - Dirty State Handling: Warning confirmation dialog when canceling a dirty form.

---

## ⚖ Known Limitations & Trade-Offs

1. **Storage Mechanism:** The app uses `localStorage` rather than `IndexedDB`. While `localStorage` is synchronous and simple to migrate, large datasets (>5MB) would benefit from asynchronous IndexedDB storage.
2. **Optimistic Drag-and-Drop:** Uses native HTML5 Drag and Drop API for zero bundle overhead. On mobile devices without touch-dnd polyfills, users rely on the accessible Quick Move buttons (`←` / `→`) and status action menus.
3. **URL State Synchronization:** URL updates use `history.replaceState` to avoid cluttering the browser history stack on rapid keystrokes.

---

## 🤖 AI Assistance Disclosure

- **Where AI was used:**
  - Initial scaffolding of TypeScript types and design tokens.
  - Drafting initial Vitest test scenarios.
- **What was changed from the suggestion:**
  - Refactored `useTasks` to eliminate an infinite re-render loop caused by an unmemoized callback reference in `useEffect`.
  - Added custom focus trapping and keyboard navigation in `Modal.tsx`.
  - Enhanced `storageMigration.ts` with explicit legacy `todo` $\rightarrow$ `backlog` property mapping.
  - Custom tuned the light brown header palette and responsive CSS layout.

---

## 📄 License
MIT
