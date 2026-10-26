import React, { useState } from "react";
import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../types/task";
import TaskCard from "./Taskcard";
import { Badge } from "./ui";

interface BoardProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
  onCreateTaskInColumn?: (status: TaskStatus) => void;
}

const columns: { status: TaskStatus; title: string; description: string }[] = [
  { status: "backlog", title: "Backlog", description: "Tasks planned for future sprints" },
  { status: "in-progress", title: "In Progress", description: "Currently being worked on" },
  { status: "done", title: "Done", description: "Completed and verified" },
];

export default function Board({
  tasks,
  onView,
  onEdit,
  onDelete,
  onMove,
  onCreateTaskInColumn,
}: BoardProps) {
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  function handleDragOver(
    event: DragEvent<HTMLElement>,
    status: TaskStatus
  ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOver !== status) {
      setDragOver(status);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLElement>,
    status: TaskStatus
  ) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }
    if (dragOver === status) {
      setDragOver(null);
    }
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
    targetStatus: TaskStatus
  ) {
    event.preventDefault();
    setDragOver(null);
    const taskId = event.dataTransfer.getData("text/plain");

    if (taskId) {
      onMove(taskId, targetStatus);
    }
  }

  return (
    <section className="board-grid" aria-label="Task workflow board">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);
        const isTarget = dragOver === column.status;

        return (
          <div
            key={column.status}
            className={`board-column board-column--${column.status} ${
              isTarget ? "board-column--drag-over" : ""
            }`}
            onDragOver={(event) => handleDragOver(event, column.status)}
            onDragLeave={(event) => handleDragLeave(event, column.status)}
            onDrop={(event) => handleDrop(event, column.status)}
            aria-label={`${column.title} column with ${columnTasks.length} tasks`}
          >
            <header className="column-header">
              <div className="column-header-title">
                <h2>{column.title}</h2>
                <Badge variant="neutral" size="sm">
                  {columnTasks.length}
                </Badge>
              </div>

              {onCreateTaskInColumn && (
                <button
                  type="button"
                  className="column-add-btn"
                  title={`Add task to ${column.title}`}
                  aria-label={`Add task to ${column.title}`}
                  onClick={() => onCreateTaskInColumn(column.status)}
                >
                  +
                </button>
              )}
            </header>

            <div className="column-tasks">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMove={onMove}
                  />
                ))
              ) : (
                <div className="empty-column">
                  <p>
                    {isTarget
                      ? "Drop task here to move"
                      : `No tasks in ${column.title}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
