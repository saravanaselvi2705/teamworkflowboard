import React, { useState } from "react";
import type { DragEvent } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import { Badge, type BadgeVariant, Button } from "./ui";
import { formatRelativeTime } from "../utils/date";

interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

const statuses: TaskStatus[] = ["backlog", "in-progress", "done"];

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

  const priorityVariantMap: Record<TaskPriority, BadgeVariant> = {
    high: "danger",
    medium: "warning",
    low: "neutral",
  };

  const statusTitleMap: Record<TaskStatus, string> = {
    backlog: "Backlog",
    "in-progress": "In Progress",
    done: "Done",
  };

  return (
    <article
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-card-header">
        <span className="drag-handle" title="Drag to move task" aria-hidden="true">
          ⠿
        </span>

        <Badge variant={priorityVariantMap[task.priority]} size="sm">
          {task.priority.toUpperCase()}
        </Badge>

        <span className="task-relative-time" title={new Date(task.updatedAt || task.createdAt).toLocaleString()}>
          {formatRelativeTime(task.updatedAt || task.createdAt)}
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
            <div className="task-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onView(task);
                }}
              >
                View details
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
              >
                Edit task
              </button>

              <button
                type="button"
                role="menuitem"
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
        <h3 className="task-card-title">{task.title}</h3>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="task-card-tags" aria-label="Task tags">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="task-card-meta">
          <span className="task-assignee">
            <span className="assignee-avatar" aria-hidden="true">
              {(task.assignee || "U").slice(0, 1).toUpperCase()}
            </span>
            <span className="assignee-name">{task.assignee || "Unassigned"}</span>
          </span>

          {task.dueDate && (
            <span className="task-due-date" title={`Due: ${task.dueDate}`}>
              📅 {task.dueDate}
            </span>
          )}
        </div>
      </button>

      <div className="task-card-actions">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="move-button"
          disabled={currentIndex <= 0}
          aria-label={`Move to ${currentIndex > 0 ? statusTitleMap[statuses[currentIndex - 1]] : "previous status"}`}
          title={currentIndex > 0 ? `Move to ${statusTitleMap[statuses[currentIndex - 1]]}` : undefined}
          onClick={() => onMove(task.id, statuses[currentIndex - 1])}
        >
          ←
        </Button>

        <span className="task-status-label">{statusTitleMap[task.status]}</span>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="move-button"
          disabled={currentIndex >= statuses.length - 1}
          aria-label={`Move to ${currentIndex < statuses.length - 1 ? statusTitleMap[statuses[currentIndex + 1]] : "next status"}`}
          title={currentIndex < statuses.length - 1 ? `Move to ${statusTitleMap[statuses[currentIndex + 1]]}` : undefined}
          onClick={() => onMove(task.id, statuses[currentIndex + 1])}
        >
          →
        </Button>
      </div>
    </article>
  );
}
