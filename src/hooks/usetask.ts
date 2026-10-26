
import { useEffect, useState } from "react";
import type { Task } from "../types/task";

const STORAGE_KEY = "team-workflow-tasks";

function loadTasks(): Task[] {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    const parsed: unknown = JSON.parse(savedTasks);

    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(
    taskData: Omit<Task, "id" | "createdAt">
  ) {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
  }

  function updateTask(
    id: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>
  ) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }

  function deleteTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );
  }

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
  };
}
