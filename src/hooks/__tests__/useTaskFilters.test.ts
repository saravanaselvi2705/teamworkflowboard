import { describe, it, expect } from "vitest";
import {
  parseFiltersFromQuery,
  filtersToQueryString,
  type TaskFiltersState,
} from "../useTaskFilters";

describe("useTaskFilters helpers", () => {
  it("parses empty query string to default filters", () => {
    const filters = parseFiltersFromQuery("");
    expect(filters.search).toBe("");
    expect(filters.statuses).toEqual([]);
    expect(filters.priority).toBe("all");
    expect(filters.sort).toBe("created_desc");
  });

  it("parses query string with multi-select status and search", () => {
    const query = "?search=design&status=backlog,in-progress&priority=high&sort=updated_desc";
    const filters = parseFiltersFromQuery(query);
    expect(filters.search).toBe("design");
    expect(filters.statuses).toEqual(["backlog", "in-progress"]);
    expect(filters.priority).toBe("high");
    expect(filters.sort).toBe("updated_desc");
  });

  it("serializes filters into query string properly", () => {
    const state: TaskFiltersState = {
      search: "modal",
      statuses: ["in-progress"],
      priority: "medium",
      sort: "title_asc",
    };
    const qs = filtersToQueryString(state);
    expect(qs).toContain("search=modal");
    expect(qs).toContain("status=in-progress");
    expect(qs).toContain("priority=medium");
    expect(qs).toContain("sort=title_asc");
  });
});
