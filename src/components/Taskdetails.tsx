
import type { Task, TaskStatus } from "../types/task";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

const statuses: TaskStatus[] = ["todo", "in-progress", "done"];

export default function TaskDetails({
  task,
  onClose,
  onEdit,
  onDelete,
  onMove,
}: TaskDetailsProps) {
  const currentIndex = statuses.indexOf(task.status);

  const statusLabel = {
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
  }[task.status];

  function handleDelete() {
    if (window.confirm(`Delete "${task.title}"?`)) {
      onDelete(task.id);
      onClose();
    }
  }

  function handleEdit() {
    onEdit(task);
  }

  return (
    <div
      className="details-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="details-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
      >
        <header className="details-header">
          <div>
            <p className="details-eyebrow">TASK DETAILS</p>
            <h2 id="details-title">{task.title}</h2>
          </div>

          <button
            type="button"
            className="details-close"
            onClick={onClose}
            aria-label="Close task details"
          >
            ×
          </button>
        </header>

        <div className="details-body">
          <div className="details-badges">
            <span className={`priority priority-${task.priority}`}>
              {task.priority} priority
            </span>

            <span className={`status-badge status-${task.status}`}>
              {statusLabel}
            </span>
          </div>

          <section className="details-section">
            <h3>Description</h3>
            <p className="details-description">
              {task.description || "No description provided."}
            </p>
          </section>

          <section className="details-section">
            <h3>Task information</h3>

            <dl className="details-grid">
              <dt>Assignee</dt>
              <dd>{task.assignee || "Unassigned"}</dd>

              <dt>Due date</dt>
              <dd>{task.dueDate || "No due date"}</dd>

              <dt>Task ID</dt>
              <dd>{task.id}</dd>

              <dt>Created</dt>
              <dd>
                {Number.isNaN(Date.parse(task.createdAt))
                  ? "Unknown"
                  : new Date(task.createdAt).toLocaleString()}
              </dd>
            </dl>
          </section>

          <section className="details-section">
            <h3>Workflow status</h3>

            <div className="details-status-actions">
              {statuses.map((status, index) => (
                <button
                  type="button"
                  key={status}
                  className={
                    task.status === status
                      ? "status-option status-option-active"
                      : "status-option"
                  }
                  onClick={() => onMove(task.id, status)}
                >
                  {index + 1}.{" "}
                  {status === "todo"
                    ? "To Do"
                    : status === "in-progress"
                      ? "In Progress"
                      : "Done"}
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="details-footer">
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
          >
            Delete
          </button>

          <div className="details-footer-right">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Close
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleEdit}
            >
              Edit task
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
