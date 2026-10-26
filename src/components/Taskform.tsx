import React, { useEffect, useMemo, useState } from "react";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "../types/task";
import {
  Button,
  TextInput,
  TextArea,
  Select,
  Tag,
  ConfirmDialog,
} from "./ui";

interface TaskFormProps {
  initialTask: Task | null;
  onSubmit: (task: TaskInput) => void;
  onCancel: () => void;
}

export default function TaskForm({
  initialTask,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDirtyConfirm, setShowDirtyConfirm] = useState(false);

  // Populate form when initialTask changes
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setStatus(initialTask.status);
      setPriority(initialTask.priority);
      setAssignee(initialTask.assignee);
      setDueDate(initialTask.dueDate ?? "");
      setTags(initialTask.tags ?? []);
    } else {
      setTitle("");
      setDescription("");
      setStatus("backlog");
      setPriority("medium");
      setAssignee("");
      setDueDate("");
      setTags([]);
    }
    setErrors({});
  }, [initialTask]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    if (initialTask) {
      return (
        title !== initialTask.title ||
        description !== initialTask.description ||
        status !== initialTask.status ||
        priority !== initialTask.priority ||
        assignee !== initialTask.assignee ||
        dueDate !== (initialTask.dueDate ?? "") ||
        JSON.stringify(tags) !== JSON.stringify(initialTask.tags ?? [])
      );
    }
    return (
      title.trim() !== "" ||
      description.trim() !== "" ||
      status !== "backlog" ||
      priority !== "medium" ||
      assignee.trim() !== "" ||
      dueDate !== "" ||
      tags.length > 0
    );
  }, [initialTask, title, description, status, priority, assignee, dueDate, tags]);

  function handleAddTag(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = newTagInput.trim();
    if (!trimmed) return;

    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setErrors((prev) => ({ ...prev, tag: "This tag already exists." }));
      return;
    }

    setTags((prev) => [...prev, trimmed]);
    setNewTagInput("");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.tag;
      return next;
    });
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Task title is required.";
    } else if (title.trim().length < 3) {
      newErrors.title = "Task title must be at least 3 characters.";
    } else if (title.trim().length > 100) {
      newErrors.title = "Task title cannot exceed 100 characters.";
    }

    if (description.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assignee.trim(),
      tags,
      dueDate: dueDate || undefined,
    });
  }

  function handleCancelAttempt() {
    if (isDirty) {
      setShowDirtyConfirm(true);
    } else {
      onCancel();
    }
  }

  return (
    <>
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <TextInput
          id="task-title-input"
          label="Title"
          required
          placeholder="e.g. Design authentication modal"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.title;
                return copy;
              });
            }
          }}
          error={errors.title}
          maxLength={100}
        />

        <TextArea
          id="task-description-input"
          label="Description"
          placeholder="Detailed task description (multi-line supported)..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          helperText="Rich multi-line text explaining the requirements and context."
        />

        <div className="form-row">
          <Select
            id="task-status-select"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: "backlog", label: "Backlog" },
              { value: "in-progress", label: "In Progress" },
              { value: "done", label: "Done" },
            ]}
          />

          <Select
            id="task-priority-select"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { value: "low", label: "Low Priority" },
              { value: "medium", label: "Medium Priority" },
              { value: "high", label: "High Priority" },
            ]}
          />
        </div>

        <div className="form-row">
          <TextInput
            id="task-assignee-input"
            label="Assignee"
            placeholder="e.g. Alex Rivera"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />

          <TextInput
            id="task-due-date-input"
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-tags-section">
          <label className="ui-label" htmlFor="task-tag-input">
            Tags
          </label>
          <div className="tags-input-group">
            <TextInput
              id="task-tag-input"
              placeholder="Add a tag and press Enter"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              error={errors.tag}
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => handleAddTag()}
            >
              + Add Tag
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="task-tags-list" aria-label="Selected tags">
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  variant="primary"
                  size="md"
                  onRemove={() => handleRemoveTag(tag)}
                  removeAriaLabel={`Remove ${tag} tag`}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleCancelAttempt}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialTask ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>

      {/* Dirty state confirmation dialog */}
      <ConfirmDialog
        isOpen={showDirtyConfirm}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes in this task. If you close now, your edits will be lost."
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        variant="destructive"
        onConfirm={() => {
          setShowDirtyConfirm(false);
          onCancel();
        }}
        onCancel={() => setShowDirtyConfirm(false)}
      />
    </>
  );
}
