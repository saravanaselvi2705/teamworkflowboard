import React from "react";

export type AlertVariant = "info" | "warning" | "error" | "success";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
}

export function Alert({
  variant = "info",
  title,
  children,
  className = "",
  onClose,
  ...props
}: AlertProps) {
  const iconMap: Record<AlertVariant, string> = {
    info: "ℹ",
    warning: "⚠",
    error: "✕",
    success: "✓",
  };

  return (
    <div
      role="alert"
      className={`ui-alert ui-alert--${variant} ${className}`}
      {...props}
    >
      <span className="ui-alert-icon" aria-hidden="true">
        {iconMap[variant]}
      </span>
      <div className="ui-alert-body">
        {title && <strong className="ui-alert-title">{title}</strong>}
        <div className="ui-alert-message">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ui-alert-close"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
