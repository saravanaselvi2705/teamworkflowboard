
import { useState } from "react";
import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../types/task";
import TaskCard from "./Taskcard";

interface BoardProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

const columns: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

export default function Board({
  tasks,
  onView,
  onEdit,
  onDelete,
  onMove,
}: BoardProps) {
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  function handleDragOver(
    event: DragEvent<HTMLElement>,
    status: TaskStatus
  ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOver(status);
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
    status: TaskStatus
  ) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("text/plain");

    if (taskId) {
      onMove(taskId, status);
    }

    setDragOver(null);
  }

  return (
    <div className="board">
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.status
        );

        return (
          <section
            key={column.status}
            className={`board-column ${
              dragOver === column.status ? "drag-over" : ""
            }`}
            onDragOver={(event) =>
              handleDragOver(event, column.status)
            }
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setDragOver(null);
              }
            }}
            onDrop={(event) => handleDrop(event, column.status)}
          >
            <header className="column-header">
              <h2>{column.title}</h2>
              <span className="task-count">
                {columnTasks.length}
              </span>
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
                <p className="empty-column">
                  {dragOver === column.status
                    ? "Drop task here"
                    : "No tasks yet"}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
