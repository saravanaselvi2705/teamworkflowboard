import React, { forwardRef, useId } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, id, children, className = "", required, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

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
          <label htmlFor={selectId} className="ui-label">
            {label}
            {required && <span className="ui-required-mark" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="ui-select-wrapper">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`ui-select ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="ui-select-chevron" aria-hidden="true">
            ▾
          </span>
        </div>
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

Select.displayName = "Select";
