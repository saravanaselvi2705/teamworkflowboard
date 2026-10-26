import React from "react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const type = toast.type || "info";

  const iconMap: Record<ToastType, string> = {
    success: "✓",
    info: "ℹ",
    warning: "⚠",
    error: "✕",
  };

  return (
    <div
      className={`ui-toast ui-toast--${type}`}
      role="status"
      aria-live="polite"
    >
      <span className="ui-toast-icon" aria-hidden="true">
        {iconMap[type]}
      </span>
      <p className="ui-toast-message">{toast.message}</p>
      <button
        type="button"
        className="ui-toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
