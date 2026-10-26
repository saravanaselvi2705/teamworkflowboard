import { useCallback, useEffect, useState } from "react";
import type { TaskPriority, TaskStatus } from "../types/task";

export type SortField = "created" | "updated" | "priority" | "title";
export type SortDirection = "asc" | "desc";

export type SortOption =
  | "created_desc"
  | "created_asc"
  | "updated_desc"
  | "priority_desc"
  | "title_asc";

export interface TaskFiltersState {
  search: string;
  statuses: TaskStatus[]; // multi-select (empty array = all)
  priority: TaskPriority | "all";
  sort: SortOption;
}

export const INITIAL_FILTERS: TaskFiltersState = {
  search: "",
  statuses: [],
  priority: "all",
  sort: "created_desc",
};

/**
 * Parses query parameters from window.location.search
 */
export function parseFiltersFromQuery(queryString: string): TaskFiltersState {
  const params = new URLSearchParams(queryString);

  const search = params.get("search") || "";

  const statusParam = params.get("status");
  const validStatuses: TaskStatus[] = ["backlog", "in-progress", "done"];
  const statuses = statusParam
    ? statusParam
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is TaskStatus => validStatuses.includes(s as TaskStatus))
    : [];

  const priorityParam = params.get("priority");
  const validPriorities: TaskPriority[] = ["low", "medium", "high"];
  const priority = validPriorities.includes(priorityParam as TaskPriority)
    ? (priorityParam as TaskPriority)
    : "all";

  const sortParam = params.get("sort");
  const validSorts: SortOption[] = [
    "created_desc",
    "created_asc",
    "updated_desc",
    "priority_desc",
    "title_asc",
  ];
  const sort = validSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "created_desc";

  return {
    search,
    statuses,
    priority,
    sort,
  };
}

/**
 * Converts filters to URLSearchParams string
 */
export function filtersToQueryString(filters: TaskFiltersState): string {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.statuses.length > 0 && filters.statuses.length < 3) {
    params.set("status", filters.statuses.join(","));
  }

  if (filters.priority !== "all") {
    params.set("priority", filters.priority);
  }

  if (filters.sort !== "created_desc") {
    params.set("sort", filters.sort);
  }

  const str = params.toString();
  return str ? `?${str}` : "";
}

export function useTaskFilters() {
  const [filters, setFilters] = useState<TaskFiltersState>(() => {
    if (typeof window !== "undefined") {
      return parseFiltersFromQuery(window.location.search);
    }
    return INITIAL_FILTERS;
  });

  // Sync state to URL query string
  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = filtersToQueryString(filters);
    const newUrl = `${window.location.pathname}${query}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (newUrl !== currentUrl) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [filters]);

  // Handle browser back/forward buttons
  useEffect(() => {
    function handlePopState() {
      setFilters(parseFiltersFromQuery(window.location.search));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const toggleStatus = useCallback((status: TaskStatus) => {
    setFilters((prev) => {
      const exists = prev.statuses.includes(status);
      const nextStatuses = exists
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses: nextStatuses };
    });
  }, []);

  const setStatuses = useCallback((statuses: TaskStatus[]) => {
    setFilters((prev) => ({ ...prev, statuses }));
  }, []);

  const setPriority = useCallback((priority: TaskPriority | "all") => {
    setFilters((prev) => ({ ...prev, priority }));
  }, []);

  const setSort = useCallback((sort: SortOption) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return {
    filters,
    setSearch,
    toggleStatus,
    setStatuses,
    setPriority,
    setSort,
    resetFilters,
  };
}
