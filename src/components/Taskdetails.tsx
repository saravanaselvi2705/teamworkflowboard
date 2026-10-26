import React, { useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import { Badge, type BadgeVariant, Button, ConfirmDialog, Modal } from "./ui";
import { formatDateTime, formatRelativeTime } from "../utils/date";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

const statuses: { status: TaskStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "in-progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

export default function TaskDetails({
  task,
  onClose,
  onEdit,
  onDelete,
  onMove,
}: TaskDetailsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const priorityVariantMap: Record<TaskPriority, BadgeVariant> = {
    high: "danger",
    medium: "warning",
    low: "neutral",
  };

  const statusVariantMap: Record<TaskStatus, BadgeVariant> = {
    backlog: "neutral",
    "in-progress": "primary",
    done: "success",
  };

  function handleDeleteConfirmed() {
    onDelete(task.id);
    setShowDeleteConfirm(false);
    onClose();
  }

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={task.title}
        description="Task Details & Workflow Actions"
        size="md"
      >
        <div className="details-content">
          <div className="details-badges">
            <Badge variant={priorityVariantMap[task.priority]} size="md">
              {task.priority.toUpperCase()} PRIORITY
            </Badge>

            <Badge variant={statusVariantMap[task.status]} size="md">
              {statuses.find((s) => s.status === task.status)?.label ?? task.status}
            </Badge>

            <span className="details-timestamp">
              Updated {formatRelativeTime(task.updatedAt || task.createdAt)}
            </span>
          </div>

          <section className="details-section">
            <h3 className="details-heading">Description</h3>
            <p className="details-description">
              {task.description || "No description provided."}
            </p>
          </section>

          {task.tags && task.tags.length > 0 && (
            <section className="details-section">
              <h3 className="details-heading">Tags</h3>
              <div className="details-tags">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section className="details-section">
            <h3 className="details-heading">Task Information</h3>
            <dl className="details-grid">
              <dt>Assignee</dt>
              <dd>
                <strong>{task.assignee || "Unassigned"}</strong>
              </dd>

              <dt>Due Date</dt>
              <dd>{task.dueDate || "No due date set"}</dd>

              <dt>Created</dt>
              <dd>{formatDateTime(task.createdAt)}</dd>

              <dt>Last Updated</dt>
              <dd>{formatDateTime(task.updatedAt || task.createdAt)}</dd>

              <dt>Task ID</dt>
              <dd>
                <code>{task.id}</code>
              </dd>
            </dl>
          </section>

          <section className="details-section">
            <h3 className="details-heading">Workflow Status</h3>
            <div className="details-status-actions" role="group" aria-label="Change workflow status">
              {statuses.map((s, index) => {
                const isActive = task.status === s.status;
                return (
                  <button
                    key={s.status}
                    type="button"
                    className={`status-option ${
                      isActive ? "status-option-active" : ""
                    }`}
                    onClick={() => onMove(task.id, s.status)}
                    aria-pressed={isActive}
                  >
                    <span className="status-step-num">{index + 1}</span>
                    <span>{s.label}</span>
                    {isActive && <span className="status-current-badge">Current</span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="details-modal-footer">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Task
          </Button>

          <div className="details-modal-right">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onEdit(task);
                onClose();
              }}
            >
              Edit Task
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
