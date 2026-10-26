import React, { useMemo, useState } from "react";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "./types/task";
import { useTasks } from "./hooks/useTasks";
import { useTaskFilters } from "./hooks/useTaskFilters";
import Board from "./components/Board";
import TaskForm from "./components/Taskform";
import TaskDetails from "./components/Taskdetails";
import Filterbar from "./components/Filterbar";
import {
  Alert,
  Button,
  Modal,
  ToastProvider,
  useToast,
} from "./components/ui";
import "./index.css";

function AppContent() {
  const { showToast } = useToast();

  const handleMigration = React.useCallback(
    (migrationMsg: string) => {
      showToast(migrationMsg, "info", 6000);
    },
    [showToast]
  );

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    resetToSampleTasks,
    triggerV1MigrationSimulation,
    storageError,
  } = useTasks(handleMigration);

  const {
    filters,
    setSearch,
    toggleStatus,
    setPriority,
    setSort,
    resetFilters,
  } = useTaskFilters();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  // Filter and sort tasks with useMemo
  const filteredTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const priorityWeight: Record<TaskPriority, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const matches = tasks.filter((task) => {
      // Text search in title, description, and tags
      const titleMatch = task.title.toLowerCase().includes(search);
      const descMatch = task.description.toLowerCase().includes(search);
      const tagsMatch = task.tags?.some((t) => t.toLowerCase().includes(search));
      const assigneeMatch = task.assignee.toLowerCase().includes(search);
      const matchesText = !search || titleMatch || descMatch || tagsMatch || assigneeMatch;

      // Multi-select status filter
      const matchesStatus =
        filters.statuses.length === 0 || filters.statuses.includes(task.status);

      // Priority filter
      const matchesPriority =
        filters.priority === "all" || task.priority === filters.priority;

      return matchesText && matchesStatus && matchesPriority;
    });

    return [...matches].sort((a, b) => {
      switch (filters.sort) {
        case "created_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        case "updated_desc": {
          const timeA = new Date(a.updatedAt || a.createdAt).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt).getTime();
          return timeB - timeA;
        }

        case "priority_desc": {
          const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
          if (diff !== 0) return diff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        case "title_asc":
          return a.title.localeCompare(b.title);

        case "created_desc":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [tasks, filters]);

  function handleOpenCreateModal(presetStatus?: TaskStatus) {
    if (presetStatus) {
      setTaskToEdit({
        id: "",
        title: "",
        description: "",
        status: presetStatus,
        priority: "medium",
        assignee: "",
        tags: [],
        createdAt: "",
        updatedAt: "",
      });
    } else {
      setTaskToEdit(null);
    }
    setIsFormOpen(true);
  }

  function handleOpenEditModal(task: Task) {
    setTaskToEdit(task);
    setIsFormOpen(true);
  }

  function handleFormSubmit(taskData: TaskInput) {
    if (taskToEdit && taskToEdit.id) {
      updateTask(taskToEdit.id, taskData);
      showToast(`Task "${taskData.title}" updated successfully`, "success");
    } else {
      addTask(taskData);
      showToast(`Task "${taskData.title}" created successfully`, "success");
    }
    setIsFormOpen(false);
    setTaskToEdit(null);
  }

  function handleDeleteTask(id: string) {
    const taskToDelete = tasks.find((t) => t.id === id);
    deleteTask(id);
    showToast(`Task "${taskToDelete?.title || id}" deleted`, "info");
    if (viewingTask?.id === id) {
      setViewingTask(null);
    }
  }

  function handleMoveTask(id: string, status: TaskStatus) {
    updateTask(id, { status });
    const targetStatusLabels: Record<TaskStatus, string> = {
      backlog: "Backlog",
      "in-progress": "In Progress",
      done: "Done",
    };
    showToast(`Task moved to ${targetStatusLabels[status]}`, "info", 2000);
  }

  const currentViewingTask = viewingTask
    ? tasks.find((t) => t.id === viewingTask.id) ?? null
    : null;

  return (
    <main className="app">
      {/* Storage Error Alert */}
      {storageError && (
        <Alert variant="error" title="Storage Notice">
          {storageError}
        </Alert>
      )}

      {/* Main Header */}
      <header className="app-header">
        <div className="app-header-text">
          <p className="eyebrow">TEAM WORKSPACE</p>
          <h1>Workflow Board</h1>
          <p className="subtitle">
            Organize tasks, track progress and keep your team moving forward.
          </p>
        </div>

        <div className="app-header-actions">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => handleOpenCreateModal()}
            className="btn-create-task"
          >
            + Create Task
          </Button>
        </div>
      </header>

      {/* Persistence & Migration Control Panel (for evaluation) */}
      <div className="migration-banner" aria-label="Assignment utilities">
        <span className="migration-banner-label">
          🛠 <strong>Assignment Features:</strong>
        </span>
        <div className="migration-banner-buttons">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              triggerV1MigrationSimulation();
              showToast("Simulated v1 schema in storage and executed migration to v2!", "info");
            }}
            title="Simulates older Schema v1 data in localStorage and runs automated migration"
          >
            Simulate v1 Data & Migration
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              resetToSampleTasks();
              showToast("Reset to sample tasks", "success");
            }}
          >
            Reset Sample Tasks
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <section className="summary" aria-label="Task metrics summary">
        <div className="summary-card">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="summary-card">
          <span>Backlog</span>
          <strong>{tasks.filter((t) => t.status === "backlog").length}</strong>
        </div>

        <div className="summary-card">
          <span>In Progress</span>
          <strong>{tasks.filter((t) => t.status === "in-progress").length}</strong>
        </div>

        <div className="summary-card">
          <span>Done</span>
          <strong>{tasks.filter((t) => t.status === "done").length}</strong>
        </div>
      </section>

      {/* Search & Filter Bar with URL synchronization */}
      <Filterbar
        filters={filters}
        onSearchChange={setSearch}
        onStatusToggle={toggleStatus}
        onPriorityChange={setPriority}
        onSortChange={setSort}
        onReset={resetFilters}
        totalTasksCount={tasks.length}
        filteredTasksCount={filteredTasks.length}
      />

      {/* Board & Empty States */}
      {tasks.length === 0 ? (
        <div className="empty-state-card" role="region" aria-label="Empty board">
          <div className="empty-state-icon">📋</div>
          <h2>No Tasks Yet</h2>
          <p>Get started by creating a new task or loading sample project tasks.</p>
          <div className="empty-state-actions">
            <Button variant="primary" onClick={() => handleOpenCreateModal()}>
              + Create First Task
            </Button>
            <Button variant="secondary" onClick={resetToSampleTasks}>
              Load Sample Tasks
            </Button>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state-card" role="region" aria-label="No filter matches">
          <div className="empty-state-icon">🔍</div>
          <h2>No Matching Tasks Found</h2>
          <p>
            No tasks match your current search and filters. Try clearing your search query or
            resetting filters.
          </p>
          <Button variant="secondary" onClick={resetFilters}>
            Reset All Filters
          </Button>
        </div>
      ) : (
        <Board
          tasks={filteredTasks}
          onView={setViewingTask}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
          onCreateTaskInColumn={(status) => handleOpenCreateModal(status)}
        />
      )}

      {/* Task Creation / Editing Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        title={taskToEdit && taskToEdit.id ? "Edit Task" : "Create New Task"}
        description={
          taskToEdit && taskToEdit.id
            ? "Update task details, status, priority, or tags."
            : "Fill in task details to add it to your team's workflow board."
        }
        size="md"
      >
        <TaskForm
          initialTask={taskToEdit && taskToEdit.id ? taskToEdit : null}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setTaskToEdit(null);
          }}
        />
      </Modal>

      {/* Task Details Dialog */}
      {currentViewingTask && (
        <TaskDetails
          task={currentViewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTask}
          onMove={handleMoveTask}
        />
      )}

      <footer className="app-footer">
        Team Workflow Board &bull; Design System by Ever Quint &bull; React + TypeScript
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
