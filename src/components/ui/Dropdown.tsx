"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  error,
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-surface px-3 py-2.5
          text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? "border-danger focus:border-danger" : "border-border focus:border-primary"}`}
      >
        <span className={selectedOption ? "text-ink" : "text-ink-muted/70"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown
          size={16}
          className={`shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {error && <p className="mt-1.5 text-caption text-danger">{error}</p>}

      {/* mt-1.5 gives real breathing room from the trigger — this is what the native
          <select> popup couldn't do, since browsers render it flush against the control. */}
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-floating">
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-ink-muted">No options available</p>
          )}
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectOption(option.value)}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors
                ${
                  option.value === value
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-ink hover:bg-surface-tint"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
