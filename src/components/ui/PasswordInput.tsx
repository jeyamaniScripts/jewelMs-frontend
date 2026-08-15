"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  name: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, name, error, className = "", ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
          </label>
        )}

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">
            <FiLock size={18} />
          </span>

          <input
            id={name}
            name={name}
            type={visible ? "text" : "password"}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`w-full rounded-xl border bg-surface py-2.5 pl-10 pr-10 text-sm text-ink
              placeholder:text-ink-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30
              ${error ? "border-danger focus:border-danger" : "border-border focus:border-primary"}
              ${className}`}
            {...rest}
          />

          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-ink-muted hover:text-primary"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
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

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
