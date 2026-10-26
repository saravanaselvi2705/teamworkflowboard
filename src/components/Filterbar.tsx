
import type { TaskPriority, TaskStatus } from "../types/task";

export type SortOption = "newest" | "oldest" | "title";

export interface TaskFilters {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  sort: SortOption;
}

interface FilterbarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export default function Filterbar({
  filters,
  onChange,
}: FilterbarProps) {
  function updateFilter<K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K]
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="filter-bar">
      <input
        type="search"
        aria-label="Search tasks"
        placeholder="Search by title or description..."
        value={filters.search}
        onChange={(event) =>
          updateFilter("search", event.target.value)
        }
      />

      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(event) =>
          updateFilter(
            "status",
            event.target.value as TaskFilters["status"]
          )
        }
      >
        <option value="all">All statuses</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        aria-label="Filter by priority"
        value={filters.priority}
        onChange={(event) =>
          updateFilter(
            "priority",
            event.target.value as TaskFilters["priority"]
          )
        }
      >
        <option value="all">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select
        aria-label="Sort tasks"
        value={filters.sort}
        onChange={(event) =>
          updateFilter("sort", event.target.value as SortOption)
        }
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="title">Title A–Z</option>
      </select>

      <button
        type="button"
        className="btn-secondary"
        onClick={() =>
          onChange({
            search: "",
            status: "all",
            priority: "all",
            sort: "newest",
          })
        }
      >
        Reset filters
      </button>
    </section>
  );
}
