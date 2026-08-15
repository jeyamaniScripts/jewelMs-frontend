"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "label"> {
  label: ReactNode;
  name: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, name, error, className = "", ...rest }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={name} className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-muted">
          <input
            id={name}
            name={name}
            type="checkbox"
            ref={ref}
            style={{ accentColor: "#088395" }}
            className={`mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-surface accent-primary
              focus:ring-2 focus:ring-primary/30 ${className}`}
            {...rest}
          />
          <span>{label}</span>
        </label>

        {error && <p className="mt-1.5 text-caption text-danger">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
