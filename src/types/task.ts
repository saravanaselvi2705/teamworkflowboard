export type TaskStatus = "backlog" | "in-progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
  dueDate?: string;
}

export interface TaskStorageSchemaV2 {
  schemaVersion: 2;
  tasks: Task[];
  lastMigratedAt?: string;
}
