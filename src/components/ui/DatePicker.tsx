"use client";

import { useEffect, useId, useRef, useState } from "react";
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

interface YearDropdownProps {
  year: number;
  years: number[];
  onChange: (year: number) => void;
}

function YearDropdown({ year, years, onChange }: YearDropdownProps) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const selectedYearRef = useRef<HTMLButtonElement>(null);

  return (
    <details
      ref={dropdownRef}
      className="relative"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          requestAnimationFrame(() =>
            selectedYearRef.current?.scrollIntoView({ block: "nearest" }),
          );
        }
      }}
    >
      <summary
        aria-label={`Select year, currently ${year}`}
        className="flex w-[4.75rem] cursor-pointer list-none items-center justify-between rounded-md px-1 py-1 text-sm font-medium text-ink hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-details-marker]:hidden"
      >
        {year}
        <FiChevronRight
          size={13}
          className="rotate-90 text-ink-muted"
          aria-hidden="true"
        />
      </summary>
      <div className="absolute right-0 top-full z-50 mt-1 max-h-36 w-[4.75rem] overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-floating [scrollbar-color:var(--color-primary-light)_transparent] [scrollbar-width:thin]">
        {years.map((optionYear) => (
          <button
            key={optionYear}
            ref={optionYear === year ? selectedYearRef : undefined}
            type="button"
            aria-current={optionYear === year ? "true" : undefined}
            onClick={() => {
              onChange(optionYear);
              if (dropdownRef.current) dropdownRef.current.open = false;
            }}
            className={`block w-full rounded px-2 py-1 text-left text-sm text-ink hover:bg-surface-tint ${
              optionYear === year ? "bg-surface-tint font-medium text-primary" : ""
            }`}
          >
            {optionYear}
          </button>
        ))}
      </div>
    </details>
  );
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
  const monthSelectId = useId();

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
  const currentYear = today.getFullYear();
  const firstYear = Math.min(
    minDate?.getFullYear() ?? currentYear - 100,
    selectedDate?.getFullYear() ?? currentYear - 100,
  );
  const lastYear = Math.max(
    maxDate?.getFullYear() ?? currentYear + 10,
    selectedDate?.getFullYear() ?? currentYear + 10,
  );
  const years = Array.from(
    { length: lastYear - firstYear + 1 },
    (_, index) => firstYear + index,
  );

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
            <div className="flex min-w-0 items-center gap-1">
              <label className="sr-only" htmlFor="date-picker-month">
                Month
              </label>
              <select
                id={monthSelectId}
                value={viewDate.getMonth()}
                onChange={(event) =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), Number(event.target.value), 1),
                  )
                }
                className="max-w-32 rounded-md bg-transparent px-1 py-1 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {MONTH_LABELS.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <YearDropdown
                year={viewDate.getFullYear()}
                years={years}
                onChange={(year) =>
                  setViewDate(new Date(year, viewDate.getMonth(), 1))
                }
              />
            </div>
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
