import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "../App";

describe("Workflow and Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("core workflow: creates a new task and displays it on the board", () => {
    render(<App />);

    // Click "+ Create Task" in header
    const createBtn = screen.getByRole("button", { name: /\+ Create Task/i });
    fireEvent.click(createBtn);

    // Modal should be open
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    // Fill in task title using placeholder to uniquely select the modal field
    const titleInput = screen.getByPlaceholderText("e.g. Design authentication modal");
    fireEvent.change(titleInput, { target: { value: "Automated Integration Test Task" } });

    // Fill in description
    const descInput = screen.getByPlaceholderText(/Detailed task description/i);
    fireEvent.change(descInput, {
      target: { value: "Verifies that tasks can be created and persisted on the board." },
    });

    // Fill in assignee
    const assigneeInput = screen.getByPlaceholderText("e.g. Alex Rivera");
    fireEvent.change(assigneeInput, { target: { value: "QA Specialist" } });

    // Add a tag
    const tagInput = screen.getByPlaceholderText(/Add a tag and press Enter/i);
    fireEvent.change(tagInput, { target: { value: "Testing" } });
    const addTagBtn = screen.getByRole("button", { name: /\+ Add Tag/i });
    fireEvent.click(addTagBtn);

    // Tag badge should be displayed
    expect(screen.getByText("Testing")).toBeInTheDocument();

    // Submit form using the modal submit button
    const submitBtn = within(modal).getByRole("button", { name: /^Create Task$/i });
    fireEvent.click(submitBtn);

    // Modal should close
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Task card should now appear on the board
    expect(screen.getByText("Automated Integration Test Task")).toBeInTheDocument();
    expect(screen.getByText("QA Specialist")).toBeInTheDocument();
    expect(screen.getByText("#Testing")).toBeInTheDocument();
  });

  it("non-trivial behavior: filters tasks by search text and status multi-select", () => {
    render(<App />);

    // Initially sample tasks are loaded
    expect(screen.getByText("Implement accessible modal component")).toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/Search tasks, descriptions, or tags/i);
    fireEvent.change(searchInput, { target: { value: "modal" } });

    // Matching task is displayed
    expect(screen.getByText("Implement accessible modal component")).toBeInTheDocument();

    // Non-matching task is filtered out
    expect(
      screen.queryByText("Design team workflow retrospective dashboard")
    ).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });

    // Click "Done" status filter pill within status filter group
    const statusGroup = screen.getByRole("group", { name: /Filter by status/i });
    const donePill = within(statusGroup).getByRole("button", { name: /Done/i });
    fireEvent.click(donePill);

    // Only Done tasks should remain visible
    expect(screen.getByText("Implement accessible modal component")).toBeInTheDocument();
    expect(
      screen.queryByText("Sync URL query parameters with filter bar")
    ).not.toBeInTheDocument();
  });

  it("non-trivial behavior: moves task to next status column", () => {
    render(<App />);

    // Find the Backlog task: "Design team workflow retrospective dashboard"
    const taskCard = screen.getByRole("article", {
      name: /Task: Design team workflow retrospective dashboard/i,
    });
    expect(taskCard).toBeInTheDocument();

    // Click move button (→) to move from Backlog to In Progress
    const moveNextBtn = within(taskCard).getByTitle(/Move to In Progress/i);
    fireEvent.click(moveNextBtn);

    // Verify task is now located inside the In Progress column
    const inProgressColumn = screen.getByLabelText(/In Progress column/i);
    expect(
      within(inProgressColumn).getByText("Design team workflow retrospective dashboard")
    ).toBeInTheDocument();
  });

  it("dirty state handling: warns user with confirmation dialog when discarding edits", () => {
    render(<App />);

    // Open create task form
    fireEvent.click(screen.getByRole("button", { name: /\+ Create Task/i }));

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    // Modify title to make form dirty
    const titleInput = screen.getByPlaceholderText("e.g. Design authentication modal");
    fireEvent.change(titleInput, { target: { value: "Draft with unsaved changes" } });

    // Click Cancel
    const cancelBtn = within(modal).getByRole("button", { name: /^Cancel$/i });
    fireEvent.click(cancelBtn);

    // Confirmation dialog should be displayed
    expect(screen.getByText(/Discard Unsaved Changes\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You have unsaved changes in this task/i)
    ).toBeInTheDocument();

    // Click "Keep Editing"
    const keepEditingBtn = screen.getByRole("button", { name: /Keep Editing/i });
    fireEvent.click(keepEditingBtn);

    // Form modal remains open with draft content
    expect(screen.getByDisplayValue("Draft with unsaved changes")).toBeInTheDocument();

    // Click Cancel again and confirm discard
    fireEvent.click(cancelBtn);
    const discardBtn = screen.getByRole("button", { name: /Discard Changes/i });
    fireEvent.click(discardBtn);

    // Dialogs should be closed
    expect(screen.queryByText(/Discard Unsaved Changes\?/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
