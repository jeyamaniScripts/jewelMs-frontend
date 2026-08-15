"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import type { IconType } from "react-icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  icon?: IconType;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, type = "text", icon: Icon, error, className = "", ...rest }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">
              <Icon size={18} />
            </span>
          )}

          <input
            id={name}
            name={name}
            type={type}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`w-full rounded-xl border bg-surface py-2.5 text-sm text-ink placeholder:text-ink-muted/60
              transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30
              ${Icon ? "pl-10 pr-3" : "px-3"}
              ${error ? "border-danger focus:border-danger" : "border-border focus:border-primary"}
              ${className}`}
            {...rest}
          />
        </div>

        {error && (
          <p id={`${name}-error`} className="mt-1.5 text-caption text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
