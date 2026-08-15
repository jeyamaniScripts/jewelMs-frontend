"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  /** Defaults to true (fills its container) — set false for inline/auto-width buttons. */
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark disabled:bg-primary/50",
  secondary:
    "bg-primary-light text-ink hover:bg-primary-light/80 active:bg-primary-light/80 disabled:opacity-50",
  outline: "border border-primary text-primary hover:bg-surface-tint disabled:opacity-50",
  ghost: "text-primary hover:bg-surface-tint disabled:opacity-50",
  danger: "bg-danger text-white hover:bg-danger/90 active:bg-danger/90 disabled:bg-danger/50",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      type = "button",
      variant = "primary",
      isLoading = false,
      disabled = false,
      fullWidth = true,
      className = "",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
          text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed
          ${fullWidth ? "w-full" : ""}
          ${VARIANT_CLASSES[variant]} ${className}`}
        {...rest}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
