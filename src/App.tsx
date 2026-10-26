
import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "./types/task";
import { useTasks } from "./hooks/usetask";
import Board from "./components/Board";
import TaskForm from "./components/Taskform";
import TaskDetails from "./components/Taskdetails";
import Filterbar, {
  type TaskFilters,
} from "./components/Filterbar";
import "./index.css";

const initialFilters: TaskFilters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "newest",
};

export default function App() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [filters, setFilters] =
    useState<TaskFilters>(initialFilters);

  const [showForm, setShowForm] = useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [viewingTask, setViewingTask] =
    useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const result = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.assignee.toLowerCase().includes(search);

      const matchesStatus =
        filters.status === "all" ||
        task.status === filters.status;

      const matchesPriority =
        filters.priority === "all" ||
        task.priority === filters.priority;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });

    return result.sort((a, b) => {
      if (filters.sort === "title") {
        return a.title.localeCompare(b.title);
      }

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return filters.sort === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [tasks, filters]);

  function handleCreateTask() {
    setSelectedTask(null);
    setViewingTask(null);
    setShowForm(true);
  }

  function handleEdit(task: Task) {
    setViewingTask(null);
    setSelectedTask(task);
    setShowForm(true);
  }

  function handleFormSubmit(
    taskData: Omit<Task, "id" | "createdAt">
  ) {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
    } else {
      addTask(taskData);
    }

    setShowForm(false);
    setSelectedTask(null);
  }

  function handleCancelForm() {
    setShowForm(false);
    setSelectedTask(null);
  }

  function handleDelete(id: string) {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (confirmed) {
      deleteTask(id);

      if (viewingTask?.id === id) {
        setViewingTask(null);
      }

      if (selectedTask?.id === id) {
        setSelectedTask(null);
        setShowForm(false);
      }
    }
  }

  function handleMoveTask(
    id: string,
    status: TaskStatus
  ) {
    updateTask(id, { status });
  }

  const currentViewingTask = viewingTask
    ? tasks.find((task) => task.id === viewingTask.id) ?? null
    : null;

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">TEAM WORKSPACE</p>

          <h1>Workflow Board</h1>

          <p className="subtitle">
            Organize tasks, track progress and keep your
            team moving forward.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleCreateTask}
        >
          + Create Task
        </button>
      </header>

      <section
        className="summary"
        aria-label="Task summary"
      >
        <div className="summary-card">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="summary-card">
          <span>To Do</span>
          <strong>
            {tasks.filter((task) => task.status === "todo").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>In Progress</span>
          <strong>
            {
              tasks.filter(
                (task) => task.status === "in-progress"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Completed</span>
          <strong>
            {tasks.filter((task) => task.status === "done").length}
          </strong>
        </div>
      </section>

      <Filterbar
        filters={filters}
        onChange={setFilters}
      />

      <Board
        tasks={filteredTasks}
        onView={setViewingTask}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMove={handleMoveTask}
      />

      {showForm && (
        <div
          className="form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCancelForm();
            }
          }}
        >
          <div
            className="form-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              selectedTask ? "Edit task" : "Create task"
            }
          >
            <TaskForm
              initialTask={selectedTask}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {currentViewingTask && (
        <TaskDetails
          task={currentViewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMove={handleMoveTask}
        />
      )}

      <footer className="app-footer">
        Team Workflow Board · Built with React and TypeScript
      </footer>
    </main>
  );
}
