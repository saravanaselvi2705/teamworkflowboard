import React, { forwardRef, useId } from "react";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, id, className = "", required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className={`ui-form-field ${error ? "ui-form-field--error" : ""}`}>
        {label && (
          <label htmlFor={inputId} className="ui-label">
            {label}
            {required && <span className="ui-required-mark" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`ui-input ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} className="ui-error-text" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="ui-helper-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
