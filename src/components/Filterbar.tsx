import React from "react";
import type { TaskPriority, TaskStatus } from "../types/task";
import type { SortOption, TaskFiltersState } from "../hooks/useTaskFilters";
import { Button, Select, TextInput, Badge } from "./ui";

interface FilterbarProps {
  filters: TaskFiltersState;
  onSearchChange: (search: string) => void;
  onStatusToggle: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority | "all") => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
  totalTasksCount: number;
  filteredTasksCount: number;
}

const statusOptions: { status: TaskStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "in-progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

export default function Filterbar({
  filters,
  onSearchChange,
  onStatusToggle,
  onPriorityChange,
  onSortChange,
  onReset,
  totalTasksCount,
  filteredTasksCount,
}: FilterbarProps) {
  const isFiltered =
    filters.search.trim() !== "" ||
    filters.statuses.length > 0 ||
    filters.priority !== "all" ||
    filters.sort !== "created_desc";

  return (
    <section className="filter-bar" aria-label="Task filters and sorting">
      <div className="filter-bar-main">
        {/* Search Input */}
        <div className="filter-search-wrapper">
          <TextInput
            type="search"
            aria-label="Search tasks by title, description or tags"
            placeholder="Search tasks, descriptions, or tags..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-search-input"
          />
        </div>

        {/* Priority Filter */}
        <div className="filter-select-wrapper">
          <Select
            aria-label="Filter by priority"
            value={filters.priority}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority | "all")}
            options={[
              { value: "all", label: "All Priorities" },
              { value: "high", label: "High Priority" },
              { value: "medium", label: "Medium Priority" },
              { value: "low", label: "Low Priority" },
            ]}
          />
        </div>

        {/* Sort Select */}
        <div className="filter-select-wrapper">
          <Select
            aria-label="Sort tasks"
            value={filters.sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            options={[
              { value: "created_desc", label: "Created Date (Newest)" },
              { value: "created_asc", label: "Created Date (Oldest)" },
              { value: "updated_desc", label: "Recently Updated" },
              { value: "priority_desc", label: "Priority (High to Low)" },
              { value: "title_asc", label: "Title (A–Z)" },
            ]}
          />
        </div>

        {/* Reset Filters button */}
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="filter-reset-btn"
            onClick={onReset}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Multi-select Status Filter Pills */}
      <div className="filter-status-pills" role="group" aria-label="Filter by status (multi-select)">
        <span className="status-pills-label">Status filter:</span>

        {statusOptions.map((opt) => {
          const isSelected = filters.statuses.includes(opt.status);
          return (
            <button
              key={opt.status}
              type="button"
              className={`status-filter-pill ${
                isSelected ? "status-filter-pill--active" : ""
              }`}
              onClick={() => onStatusToggle(opt.status)}
              aria-pressed={isSelected}
            >
              <span className="status-pill-checkbox" aria-hidden="true">
                {isSelected ? "✓" : "○"}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}

        {filters.statuses.length === 0 && (
          <span className="status-filter-hint">(Showing all columns)</span>
        )}
      </div>

      {/* Match count indicator */}
      {isFiltered && (
        <div className="filter-summary-row" aria-live="polite">
          <Badge variant="info" size="sm">
            Showing {filteredTasksCount} of {totalTasksCount} tasks
          </Badge>
          <span className="url-sync-hint">URL synced with filters</span>
        </div>
      )}
    </section>
  );
}
