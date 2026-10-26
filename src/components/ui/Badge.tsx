import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  onRemove?: () => void;
  removeAriaLabel?: string;
}

export function Badge({
  variant = "default",
  size = "md",
  children,
  className = "",
  onRemove,
  removeAriaLabel = "Remove tag",
  ...props
}: BadgeProps) {
  const classNames = [
    "ui-badge",
    `ui-badge--${variant}`,
    `ui-badge--${size}`,
    onRemove ? "ui-badge--removable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classNames} {...props}>
      <span className="ui-badge-content">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ui-badge-remove"
          aria-label={removeAriaLabel}
        >
          ×
        </button>
      )}
    </span>
  );
}

// Export Tag alias for Tag/Badge requirement
export const Tag = Badge;
