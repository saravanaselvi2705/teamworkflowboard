
import { useState } from "react";
import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../types/task";

interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

const statuses: TaskStatus[] = ["todo", "in-progress", "done"];

export default function TaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  onMove,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentIndex = statuses.indexOf(task.status);

  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <article
      className="task-card"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="task-card-header">
        <span className="drag-handle" title="Drag to move task">
          ⠿
        </span>

        <span className={`priority priority-${task.priority}`}>
          {task.priority}
        </span>

        <div className="task-menu-wrapper">
          <button
            type="button"
            className="task-menu-trigger"
            aria-label={`Actions for ${task.title}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            ⋯
          </button>

          {menuOpen && (
            <div className="task-menu">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onView(task);
                }}
              >
                View details
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
              >
                Edit task
              </button>

              <button
                type="button"
                className="task-menu-delete"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task.id);
                }}
              >
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="task-card-content"
        onClick={() => onView(task)}
        aria-label={`View details for ${task.title}`}
      >
        <h3>{task.title}</h3>

        {task.description && (
          <p className="task-description">
            {task.description}
          </p>
        )}

        <div className="task-card-details">
          <span>
            <strong>Assignee:</strong>{" "}
            {task.assignee || "Unassigned"}
          </span>

          {task.dueDate && (
            <span>
              <strong>Due:</strong> {task.dueDate}
            </span>
          )}
        </div>

        <span className="view-task-hint">View task details →</span>
      </button>

      <div className="task-card-actions">
        <button
          type="button"
          className="btn-secondary move-button"
          disabled={currentIndex === 0}
          aria-label="Move to previous status"
          title="Previous status"
          onClick={() =>
            onMove(task.id, statuses[currentIndex - 1])
          }
        >
          ←
        </button>

        <span className="task-status-label">
          {task.status === "todo"
            ? "To Do"
            : task.status === "in-progress"
              ? "In Progress"
              : "Done"}
        </span>

        <button
          type="button"
          className="btn-secondary move-button"
          disabled={currentIndex === statuses.length - 1}
          aria-label="Move to next status"
          title="Next status"
          onClick={() =>
            onMove(task.id, statuses[currentIndex + 1])
          }
        >
          →
        </button>
      </div>
    </article>
  );
}
