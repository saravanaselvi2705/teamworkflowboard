import { describe, it, expect, beforeEach } from "vitest";
import {
  loadTasksWithMigration,
  saveTasksToStorage,
  simulateV1LegacyData,
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
} from "../storageMigration";

describe("Storage Migration Utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("seeds default tasks if localStorage is empty", () => {
    const result = loadTasksWithMigration();
    expect(result.tasks.length).toBeGreaterThan(0);
    expect(result.migrated).toBe(false);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it("detects and migrates v1 legacy data with status 'todo' to 'backlog'", () => {
    simulateV1LegacyData();

    // Verify raw data in storage before migration has 'todo'
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(Array.isArray(raw)).toBe(true);
    expect(raw[0].status).toBe("todo");

    // Load with migration
    const result = loadTasksWithMigration();
    expect(result.migrated).toBe(true);
    expect(result.tasks[0].status).toBe("backlog");
    expect(Array.isArray(result.tasks[0].tags)).toBe(true);
    expect(typeof result.tasks[0].updatedAt).toBe("string");

    // Verify storage is now upgraded to Schema v2
    const upgraded = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(upgraded.schemaVersion).toBe(2);
    expect(upgraded.tasks[0].status).toBe("backlog");
  });

  it("loads valid v2 data without re-migrating", () => {
    const tasks = [
      {
        id: "task-100",
        title: "Test task",
        description: "Test desc",
        status: "done" as const,
        priority: "low" as const,
        assignee: "Tester",
        tags: ["Test"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    saveTasksToStorage(tasks);
    const result = loadTasksWithMigration();
    expect(result.migrated).toBe(false);
    expect(result.tasks.length).toBe(1);
    expect(result.tasks[0].id).toBe("task-100");
  });
});
