"use client";

import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  WEEKDAY_LABELS,
  MONTH_LABELS,
  parseISODate,
  toISODate,
  formatDisplayDate,
  isSameDay,
  getMonthGrid,
} from "@/lib/dateUtils";

interface DatePickerProps {
  label?: string;
  value?: string; // ISO "yyyy-mm-dd"
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
}

export default function DatePicker({
  label,
  value,
  onChange,
  error,
  placeholder = "dd/mm/yyyy",
  maxDate,
  minDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseISODate(value);
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const openPicker = () => {
    setViewDate(selectedDate ?? new Date());
    setIsOpen(true);
  };

  const goToPreviousMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goToNextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectDay = (day: Date) => {
    onChange(toISODate(day));
    setIsOpen(false);
  };

  const monthGrid = getMonthGrid(viewDate);
  const today = new Date();

  const isDisabled = (day: Date) => (maxDate && day > maxDate) || (minDate && day < minDate);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}

      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        className={`flex w-full items-center gap-2.5 rounded-xl border bg-surface px-3 py-2.5 text-left text-sm
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30
          ${error ? "border-danger focus:border-danger" : "border-border focus:border-primary"}`}
      >
        <FiCalendar size={17} className="shrink-0 text-ink-muted" />
        <span className={value ? "text-ink" : "text-ink-muted/70"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {error && <p className="mt-1.5 text-caption text-danger">{error}</p>}

      {isOpen && (
        <div className="absolute z-20 mt-1.5 w-72 rounded-xl border border-border bg-surface p-3 shadow-floating">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-tint hover:text-primary"
              aria-label="Previous month"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-ink">
              {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-tint hover:text-primary"
              aria-label="Next month"
            >
              <FiChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_LABELS.map((weekday) => (
              <span key={weekday} className="py-1 text-caption font-medium text-ink-muted">
                {weekday}
              </span>
            ))}

            {monthGrid.map((day) => {
              const inCurrentMonth = day.getMonth() === viewDate.getMonth();
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              const disabled = isDisabled(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={`rounded-lg py-1.5 text-sm transition-colors
                    ${!inCurrentMonth ? "text-ink-muted/40" : "text-ink"}
                    ${disabled ? "cursor-not-allowed opacity-30" : "hover:bg-surface-tint"}
                    ${isSelected ? "bg-primary text-white hover:bg-primary" : ""}
                    ${isToday && !isSelected ? "font-semibold text-primary" : ""}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="mt-2 w-full rounded-lg border border-border py-1.5 text-caption font-medium text-ink-muted hover:border-danger hover:text-danger"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
