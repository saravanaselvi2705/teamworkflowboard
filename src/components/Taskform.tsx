
import { useEffect, useState } from "react";
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "../types/task";

interface TaskFormProps {
  initialTask: Task | null;
  onSubmit: (
    task: Omit<Task, "id" | "createdAt">
  ) => void;
  onCancel: () => void;
}

export default function TaskForm({
  initialTask,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] =
    useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    setTitle(initialTask?.title ?? "");
    setDescription(initialTask?.description ?? "");
    setStatus(initialTask?.status ?? "todo");
    setPriority(initialTask?.priority ?? "medium");
    setAssignee(initialTask?.assignee ?? "");
    setDueDate(initialTask?.dueDate ?? "");
  }, [initialTask]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assignee.trim(),
      dueDate,
    });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{initialTask ? "Edit Task" : "Create Task"}</h2>

      <label htmlFor="task-title">Title *</label>
      <input
        id="task-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Enter task title"
        required
        maxLength={100}
      />

      <label htmlFor="task-description">Description</label>
      <textarea
        id="task-description"
        value={description}
        onChange={(event) =>
          setDescription(event.target.value)
        }
        placeholder="Describe the task"
        rows={3}
      />

      <label htmlFor="task-status">Status</label>
      <select
        id="task-status"
        value={status}
        onChange={(event) =>
          setStatus(event.target.value as TaskStatus)
        }
      >
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <label htmlFor="task-priority">Priority</label>
      <select
        id="task-priority"
        value={priority}
        onChange={(event) =>
          setPriority(event.target.value as TaskPriority)
        }
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <label htmlFor="task-assignee">Assignee</label>
      <input
        id="task-assignee"
        value={assignee}
        onChange={(event) =>
          setAssignee(event.target.value)
        }
        placeholder="Enter team member"
      />

      <label htmlFor="task-due-date">Due Date</label>
      <input
        id="task-due-date"
        type="date"
        value={dueDate}
        onChange={(event) =>
          setDueDate(event.target.value)
        }
      />

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {initialTask ? "Save Changes" : "Create Task"}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
