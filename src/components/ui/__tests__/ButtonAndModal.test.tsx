import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";
import { Modal } from "../Modal";

describe("Button UI Component", () => {
  it("renders with correct default classes and children", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("ui-button--primary");
    expect(button).toHaveClass("ui-button--md");
  });

  it("applies variant and size props", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveClass("ui-button--destructive");
    expect(button).toHaveClass("ui-button--lg");
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled or loading", () => {
    render(<Button disabled isLoading>Processing</Button>);
    const button = screen.getByRole("button", { name: "Processing" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

describe("Modal UI Component", () => {
  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true with proper ARIA attributes", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" description="Modal description">
        <p>Modal content</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("calls onClose when escape key is pressed", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <button type="button">Inside Button</button>
      </Modal>
    );
    await user.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalled();
  });
});
