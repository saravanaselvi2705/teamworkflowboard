import type { Task, TaskPriority, TaskStatus, TaskStorageSchemaV2 } from "../types/task";

export const STORAGE_KEY = "team-workflow-tasks";
export const CURRENT_SCHEMA_VERSION = 2;

export const DEFAULT_SAMPLE_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Implement accessible modal component",
    description: "Build a WCAG-compliant dialog with focus trapping, aria-modal, and Escape key closing.",
    status: "done",
    priority: "high",
    assignee: "Alex Rivera",
    tags: ["Accessibility", "Design System"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    dueDate: "2026-11-01",
  },
  {
    id: "task-2",
    title: "Sync URL query parameters with filter bar",
    description: "Represent multi-select statuses, priority, search text, and sorting order in window.location.search.",
    status: "in-progress",
    priority: "high",
    assignee: "Morgan Chen",
    tags: ["Frontend", "UX"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    dueDate: "2026-11-05",
  },
  {
    id: "task-3",
    title: "Add schema migration & dirty form warning",
    description: "Detect v1 legacy schemas, migrate status 'todo' to 'backlog', and warn users on unsaved changes.",
    status: "in-progress",
    priority: "medium",
    assignee: "Taylor Brooks",
    tags: ["Storage", "Architecture"],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    dueDate: "2026-11-08",
  },
  {
    id: "task-4",
    title: "Design team workflow retrospective dashboard",
    description: "Compile sprint velocity metrics, completed story points, and cycle time for engineering leads.",
    status: "backlog",
    priority: "low",
    assignee: "Jordan Patel",
    tags: ["Planning", "Analytics"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export interface MigrationResult {
  tasks: Task[];
  migrated: boolean;
  migrationMessage?: string;
  error?: string;
}

/**
 * Loads tasks and performs migration from Schema v1 to v2 if needed.
 */
export function loadTasksWithMigration(): MigrationResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      // Seed default sample tasks for a rich first-run experience
      const initialPayload: TaskStorageSchemaV2 = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        tasks: DEFAULT_SAMPLE_TASKS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPayload));
      return { tasks: DEFAULT_SAMPLE_TASKS, migrated: false };
    }

    const parsed = JSON.parse(raw);

    // Case 1: Already valid Schema v2
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      parsed.schemaVersion === CURRENT_SCHEMA_VERSION &&
      Array.isArray(parsed.tasks)
    ) {
      return { tasks: parsed.tasks, migrated: false };
    }

    // Case 2: Legacy raw array or schemaVersion === 1
    let legacyTasks: unknown[] = [];
    let detectedVersion = 1;

    if (Array.isArray(parsed)) {
      legacyTasks = parsed;
      detectedVersion = 1;
    } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.tasks)) {
      legacyTasks = parsed.tasks;
      detectedVersion = parsed.schemaVersion || 1;
    }

    // Transform legacy tasks to Schema v2:
    // 1) "todo" status is migrated to "backlog"
    // 2) tags array ensured
    // 3) updatedAt populated from createdAt if missing
    const migratedTasks: Task[] = legacyTasks.map((item, idx) => {
      const t = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;

      let status: TaskStatus = "backlog";
      if (t.status === "in-progress" || t.status === "done") {
        status = t.status as TaskStatus;
      } else if (t.status === "todo" || t.status === "backlog") {
        status = "backlog";
      }

      let priority: TaskPriority = "medium";
      if (t.priority === "low" || t.priority === "high") {
        priority = t.priority;
      }

      const createdAt = typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString();
      const updatedAt = typeof t.updatedAt === "string" ? t.updatedAt : createdAt;

      const rawTags = Array.isArray(t.tags) ? t.tags : [];
      const tags = rawTags.map(String).filter(Boolean);

      return {
        id: typeof t.id === "string" && t.id ? t.id : `migrated-${idx + 1}`,
        title: typeof t.title === "string" && t.title ? t.title : "Untitled Task",
        description: typeof t.description === "string" ? t.description : "",
        status,
        priority,
        assignee: typeof t.assignee === "string" ? t.assignee : "",
        tags,
        createdAt,
        updatedAt,
        dueDate: typeof t.dueDate === "string" ? t.dueDate : undefined,
      };
    });

    // Save migrated data back to localStorage
    const newPayload: TaskStorageSchemaV2 = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks: migratedTasks,
      lastMigratedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPayload));

    return {
      tasks: migratedTasks,
      migrated: true,
      migrationMessage: `Storage schema successfully migrated from v${detectedVersion} to v${CURRENT_SCHEMA_VERSION} ("todo" status upgraded to "backlog", tags & timestamps normalized).`,
    };
  } catch (error) {
    console.error("Storage error:", error);
    return {
      tasks: DEFAULT_SAMPLE_TASKS,
      migrated: false,
      error: "Failed to read localStorage. Loaded fallback sample tasks.",
    };
  }
}

/**
 * Persists tasks in current Schema v2 format.
 */
export function saveTasksToStorage(tasks: Task[]): void {
  try {
    const payload: TaskStorageSchemaV2 = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save tasks to localStorage:", error);
    throw error;
  }
}

/**
 * Simulates older Schema v1 data in localStorage for demo / test purposes.
 */
export function simulateV1LegacyData(): void {
  const v1Data = [
    {
      id: "v1-legacy-1",
      title: "Legacy task with 'todo' status",
      description: "This task was stored in schema v1 without tags and with status: 'todo'.",
      status: "todo",
      priority: "medium",
      assignee: "Legacy User",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "v1-legacy-2",
      title: "Another legacy v1 task",
      description: "Stored in older unversioned array format.",
      status: "in-progress",
      priority: "high",
      assignee: "Senior Dev",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(v1Data));
}
