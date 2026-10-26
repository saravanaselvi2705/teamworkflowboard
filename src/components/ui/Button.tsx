import React, { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading = false, children, className = "", disabled, ...props }, ref) => {
    const classNames = [
      "ui-button",
      `ui-button--${variant}`,
      `ui-button--${size}`,
      isLoading ? "ui-button--loading" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        className={classNames}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? "true" : undefined}
        {...props}
      >
        {isLoading && <span className="ui-spinner" aria-hidden="true" />}
        <span className="ui-button-content">{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
