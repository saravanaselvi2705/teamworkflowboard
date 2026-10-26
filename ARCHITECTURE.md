# Architecture & Technical Design Notes

This document provides a deep dive into the design decisions, component hierarchy, storage migration strategy, performance optimizations, and refactoring history for the **Team Workflow Board**.

---

## 1. Component Hierarchy Sketch

```text
App (Root Provider & Shell)
 ├── ToastProvider (Context & Toast Container)
 │    └── Toast (ephemeral notification items)
 │
 └── AppContent (Container & State Orchestration)
      ├── Alert (Storage failure / quota error banner)
      ├── Header (.app-header, title, subtitle, "+ Create Task" Button)
      ├── MigrationBanner (Assignment utility controls: simulate v1 data & migrations)
      ├── Summary (KPI metric cards: Total, Backlog, In Progress, Done)
      │
      ├── Filterbar (Filters & URL Synchronization)
      │    ├── TextInput (Full-text search with icon & clear)
      │    ├── Select (Priority filter dropdown)
      │    ├── Select (Sorting order dropdown)
      │    ├── StatusFilterPills (Multi-select status filter buttons)
      │    └── Button (Reset filters CTA)
      │
      ├── Board (Kanban Columns Container)
      │    ├── BoardColumn (Backlog | In Progress | Done)
      │    │    ├── ColumnHeader (Title, count Badge, quick add Button)
      │    │    └── ColumnTasks (Drag target container)
      │    │         ├── TaskCard (Interactive task card)
      │    │         │    ├── DragHandle
      │    │         │    ├── Badge (Priority indicator: high/medium/low)
      │    │         │    ├── RelativeTime (e.g. "updated 2h ago")
      │    │         │    ├── TaskMenu (View, Edit, Delete actions)
      │    │         │    ├── TagsList (Array of Badge pills)
      │    │         │    ├── Assignee & DueDate
      │    │         │    └── MoveActions (Quick status shift buttons: ← / →)
      │    │         └── EmptyColumnPlaceholder
      │    └── EmptyStateCard (When 0 total tasks or 0 filter matches)
      │
      ├── Modal [Create / Edit Task Dialog]
      │    └── TaskForm
      │         ├── TextInput (Title with validation & error messaging)
      │         ├── TextArea (Description)
      │         ├── Select (Status)
      │         ├── Select (Priority)
      │         ├── TextInput (Assignee)
      │         ├── TextInput (Due Date)
      │         ├── TagsManager (Tag input & removable Tag badges)
      │         ├── FormActions (Submit & Cancel Buttons)
      │         └── ConfirmDialog (Dirty state warning modal)
      │
      └── Modal [Task Details Dialog]
           └── TaskDetails
                ├── Badges (Priority, Status, Timestamp)
                ├── TaskDescription
                ├── TaskTags
                ├── TaskMetadataGrid (Assignee, dates, ID)
                ├── StatusWorkflowSwitcher (Interactive step options)
                └── ModalFooter (Delete Button with ConfirmDialog, Close, Edit)
```

---

## 2. Storage Versioning & Migration Approach

### Problem
As applications evolve, data structures change:
- **v1 Schema:** Stored tasks as a raw unversioned array or with `status: "todo"`, lacking `tags` array and `updatedAt` timestamps.
- **v2 Schema:** Formalized the Kanban model to **Backlog**, **In Progress**, and **Done**, adding required `tags: string[]` and `updatedAt` tracking.

### Solution Design
1. **Versioned Storage Container:**
   ```typescript
   export interface TaskStorageSchemaV2 {
     schemaVersion: 2;
     tasks: Task[];
     lastMigratedAt?: string;
   }
   ```
2. **Detection & Safe Transformation:**
   When reading from storage, `loadTasksWithMigration()` inspects the stored JSON:
   - If `schemaVersion === 2`, data is verified and loaded directly.
   - If the data is an array or has `schemaVersion < 2`, the migration pipeline triggers:
     1. Status `"todo"` is converted to `"backlog"`.
     2. `tags` is initialized to `[]` if missing or non-array.
     3. `updatedAt` is safely derived from `createdAt` or current timestamp.
     4. Data is repackaged with `schemaVersion: 2` and written back to `localStorage`.
     5. The app triggers a non-intrusive Toast notification informing the user that their data was migrated.
3. **Simulated Migration:**
   A dedicated utility function `simulateV1LegacyData()` injects legacy Schema v1 data into storage, allowing evaluators to verify the automated migration process seamlessly via the UI.

---

## 3. Example of a Refactor During the Assignment

### The Problem: Infinite Re-Render Loop in Data Hook
During development of the toast notification system for schema migrations, `AppContent` passed an inline callback to `useTasks`:
```tsx
// Before refactor
const { tasks, ... } = useTasks((migrationMsg) => {
  showToast(migrationMsg, "info", 6000);
});
```
Inside `useTasks`:
```tsx
useEffect(() => {
  const result = loadTasksWithMigration();
  setTasks(result.tasks);
  if (result.migrated && onMigration) {
    onMigration(result.migrationMessage);
  }
}, [onMigration]); // ⚠️ Bug: Inline function reference changes on every render!
```
Because `onMigration` changed reference on every render, `useEffect` ran continuously, triggering `setTasks`, which scheduled another render, creating an **infinite re-render loop** that caused tests to freeze.

### The Refactor
1. **Stable Ref Pattern in `useTasks`:**
   ```tsx
   const onMigrationRef = useRef(onMigration);
   useEffect(() => {
     onMigrationRef.current = onMigration;
   }, [onMigration]);

   useEffect(() => {
     const result = loadTasksWithMigration();
     setTasks(result.tasks);
     setIsInitialized(true);
     if (result.migrated && onMigrationRef.current) {
       onMigrationRef.current(result.migrationMessage);
     }
   }, []); // Only runs once on mount
   ```
2. **`useCallback` at the Call Site:**
   Wrapped `handleMigration` in `useCallback` inside `AppContent`.

### The Result
- Eliminated all unnecessary re-renders.
- Test suite execution time dropped from hanging to **1.87 seconds** for all 17 tests.

---

## 4. Performance & UX Polish

1. **Memoized Filtering & Sorting:**
   Task filtering and sorting calculations are wrapped in `useMemo([tasks, filters])`. Task filtering does not re-compute unless tasks or filter criteria change.
2. **Non-blocking URL Synchronization:**
   `history.replaceState` is used to update URL query parameters without triggering full page reloads or polluting browser history stacks with every keystroke.
3. **Modal Focus Trap & Keyboard Navigation:**
   - On open, the first interactive element inside the modal receives focus automatically.
   - When tabbing past the last interactive element, focus loops back to the beginning of the modal dialog.
   - Pressing `Escape` closes the modal immediately.
   - On close, focus returns to the previously focused trigger element.
4. **Accessible Error Messaging:**
   Form validation errors use `aria-invalid="true"` and `role="alert"`, linking error text to inputs via `aria-describedby`.
