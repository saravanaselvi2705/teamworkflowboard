import { useCallback, useEffect, useRef, useState } from "react";
import type { Task, TaskInput, TaskStatus } from "../types/task";
import {
  loadTasksWithMigration,
  saveTasksToStorage,
  simulateV1LegacyData,
  DEFAULT_SAMPLE_TASKS,
  type MigrationResult,
} from "../utils/storageMigration";

export function useTasks(onMigration?: (message: string) => void) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Store stable ref to avoid infinite re-render loops from inline callback props
  const onMigrationRef = useRef(onMigration);
  useEffect(() => {
    onMigrationRef.current = onMigration;
  }, [onMigration]);

  // Initial load and schema migration (runs once on mount)
  useEffect(() => {
    const result: MigrationResult = loadTasksWithMigration();
    setTasks(result.tasks);
    setIsInitialized(true);

    if (result.migrated && result.migrationMessage && onMigrationRef.current) {
      onMigrationRef.current(result.migrationMessage);
    }

    if (result.error) {
      setStorageError(result.error);
    }
  }, []);

  // Persist tasks on change once initialized
  useEffect(() => {
    if (!isInitialized) return;

    try {
      saveTasksToStorage(tasks);
      setStorageError(null);
    } catch {
      setStorageError(
        "Failed to persist tasks to localStorage. Quota exceeded or storage is disabled."
      );
    }
  }, [tasks, isInitialized]);

  const addTask = useCallback((taskInput: TaskInput) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskInput,
      id: `task-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    return newTask;
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<TaskInput> | { status: TaskStatus }) => {
      const now = new Date().toISOString();
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? { ...task, ...updates, updatedAt: now } : task
        )
      );
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }, []);

  const resetToSampleTasks = useCallback(() => {
    setTasks(DEFAULT_SAMPLE_TASKS);
  }, []);

  const triggerV1MigrationSimulation = useCallback(() => {
    simulateV1LegacyData();
    const result = loadTasksWithMigration();
    setTasks(result.tasks);
    if (result.migrated && result.migrationMessage && onMigrationRef.current) {
      onMigrationRef.current(result.migrationMessage);
    }
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    resetToSampleTasks,
    triggerV1MigrationSimulation,
    storageError,
    isInitialized,
  };
}
