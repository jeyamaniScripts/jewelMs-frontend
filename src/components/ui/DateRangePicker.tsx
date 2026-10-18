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

interface DateRangePickerProps {
  label?: string;
  startDate?: string;
  endDate?: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
  error?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

type Preset =
  | "today"
  | "yesterday"
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "this-year"
  | "last-year"
  | "this-financial-year"
  | "last-financial-year"
  | "last-five-years"
  | "custom";
type DateRange = { startDate: string; endDate: string };

interface YearDropdownProps {
  year: number;
  years: number[];
  onChange: (year: number) => void;
}

function YearDropdown({ year, years, onChange }: YearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const selectedYearRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) selectedYearRef.current?.scrollIntoView({ block: "nearest" });
  }, [isOpen]);

  return (
    <details
      ref={dropdownRef}
      className="relative"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary aria-label={`Select year, currently ${year}`} className="flex w-[4.75rem] cursor-pointer list-none items-center justify-between rounded-md px-1 py-1 text-sm font-medium text-ink hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-details-marker]:hidden">
        {year}
        <FiChevronRight size={13} className="rotate-90 text-ink-muted" aria-hidden="true" />
      </summary>
      <div className="absolute left-0 top-full z-50 mt-1 max-h-32 w-[4.75rem] overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-floating [scrollbar-color:var(--color-primary-light)_transparent] [scrollbar-width:thin]">
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
            className={`block w-full rounded px-2 py-1 text-left text-sm font-normal text-ink hover:bg-surface-tint
              ${optionYear === year ? "bg-surface-tint font-medium text-primary" : ""}`}
          >
            {optionYear}
          </button>
        ))}
      </div>
    </details>
  );
}

const PRESETS: { id: Preset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this-week", label: "This week" },
  { id: "last-week", label: "Last week" },
  { id: "this-month", label: "This month" },
  { id: "last-month", label: "Last month" },
  { id: "this-year", label: "This year" },
  { id: "last-year", label: "Last year" },
  { id: "this-financial-year", label: "This financial year" },
  { id: "last-financial-year", label: "Last financial year" },
  { id: "last-five-years", label: "Last 5 years" },
  { id: "custom", label: "Custom" },
];

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

const formatLongDate = (value: string) => {
  const date = parseISODate(value);
  return date
    ? `${date.getDate()} ${MONTH_LABELS[date.getMonth()]?.slice(0, 3) ?? ""} ${date.getFullYear()}`
    : "";
};

const getPresetRange = (preset: Exclude<Preset, "custom">, today: Date): DateRange => {
  const year = today.getFullYear();
  const month = today.getMonth();
  const weekday = today.getDay();
  let start: Date;
  let end: Date;

  switch (preset) {
    case "today":
      start = today;
      end = today;
      break;
    case "yesterday":
      start = addDays(today, -1);
      end = start;
      break;
    case "this-week":
      start = addDays(today, -weekday);
      end = addDays(start, 6);
      break;
    case "last-week":
      end = addDays(today, -weekday - 1);
      start = addDays(end, -6);
      break;
    case "this-month":
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
      break;
    case "last-month":
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0);
      break;
    case "this-year":
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
      break;
    case "last-year":
      start = new Date(year - 1, 0, 1);
      end = new Date(year - 1, 11, 31);
      break;
    case "this-financial-year":
      start = new Date(month >= 3 ? year : year - 1, 3, 1);
      end = new Date(month >= 3 ? year + 1 : year, 2, 31);
      break;
    case "last-financial-year":
      start = new Date(month >= 3 ? year - 1 : year - 2, 3, 1);
      end = new Date(month >= 3 ? year : year - 1, 2, 31);
      break;
    case "last-five-years":
      end = today;
      start = new Date(year - 5, month, today.getDate());
      break;
  }

  return { startDate: toISODate(start), endDate: toISODate(end) };
};

export default function DateRangePicker({
  label,
  startDate = "",
  endDate = "",
  onChange,
  error,
  placeholder = "Select date range",
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>({ startDate, endDate });
  const [activePreset, setActivePreset] = useState<Preset>("custom");
  const [popupWidth, setPopupWidth] = useState(928);
  const [firstMonth, setFirstMonth] = useState(() => {
    const initial = parseISODate(startDate) ?? new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const presetNavRef = useRef<HTMLElement>(null);
  const start = parseISODate(draft.startDate);
  const end = parseISODate(draft.endDate);
  const secondMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + 1, 1);

  useEffect(() => {
    if (!isOpen) return;

    if (presetNavRef.current) {
      presetNavRef.current.scrollTop = 0;
      presetNavRef.current.scrollLeft = 0;
    }

    const updatePopupWidth = () => {
      const left = wrapperRef.current?.getBoundingClientRect().left ?? 8;
      const availableWidth = window.innerWidth - Math.max(8, left) - 16;
      setPopupWidth(Math.max(280, Math.min(928, availableWidth)));
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    updatePopupWidth();
    window.addEventListener("resize", updatePopupWidth);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("resize", updatePopupWidth);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const openPicker = () => {
    const today = startOfDay(new Date());
    const hasExistingRange = Boolean(startDate && endDate);
    const initialRange = hasExistingRange
      ? { startDate, endDate }
      : startDate
        ? { startDate, endDate: "" }
        : getPresetRange("today", today);
    setDraft(initialRange);
    const initial = parseISODate(initialRange.startDate) ?? today;
    setFirstMonth(new Date(initial.getFullYear(), initial.getMonth(), 1));
    setActivePreset(hasExistingRange || startDate ? "custom" : "today");
    setIsOpen(true);
  };

  const closePicker = () => setIsOpen(false);
  const min = minDate ? startOfDay(minDate) : undefined;
  const max = maxDate ? startOfDay(maxDate) : undefined;

  const isDisabled = (day: Date) =>
    Boolean((min && day < min) || (max && day > max) || (start && !end && day < start));

  const selectDay = (day: Date) => {
    const selected = toISODate(day);
    if (!start || end || day < start) {
      setDraft({ startDate: selected, endDate: "" });
    } else {
      setDraft({ startDate: draft.startDate, endDate: selected });
    }
    setActivePreset("custom");
  };

  const selectPreset = (preset: Preset) => {
    setActivePreset(preset);
    if (preset === "custom") return;

    const today = startOfDay(new Date());
    const nextRange = getPresetRange(preset, today);
    setDraft(nextRange);
    const rangeStart = parseISODate(nextRange.startDate) ?? today;
    setFirstMonth(new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1));
  };

  const updateVisibleMonth = (side: "left" | "right", year: number, month: number) => {
    const selectedMonth = new Date(year, month, 1);
    setFirstMonth(
      side === "left"
        ? selectedMonth
        : new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    );
  };

  const applyRange = () => {
    if (!draft.startDate || !draft.endDate) return;
    onChange(draft);
    setIsOpen(false);
  };

  const renderCalendar = (month: Date, side: "left" | "right") => {
    const monthGrid = getMonthGrid(month);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, index) => currentYear - 10 + index);
    if (!years.includes(month.getFullYear())) years.push(month.getFullYear());
    years.sort((a, b) => a - b);

    return (
      <section className="min-w-0 px-4 py-3" aria-label={`${MONTH_LABELS[month.getMonth()]} ${month.getFullYear()}`}>
        <div className="mb-3 flex items-center justify-between">
          {side === "left" ? (
            <button
              type="button"
              onClick={() => setFirstMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="rounded-lg border border-border p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
              aria-label="Previous month"
            >
              <FiChevronLeft size={16} />
            </button>
          ) : (
            <span className="w-9" />
          )}
          <div className="flex min-w-0 items-center gap-1">
            <label className="sr-only" htmlFor={`date-range-month-${side}`}>Month</label>
            <select
              id={`date-range-month-${side}`}
              value={month.getMonth()}
              onChange={(event) =>
                updateVisibleMonth(side, month.getFullYear(), Number(event.target.value))
              }
              className="max-w-32 rounded-md bg-transparent px-1 py-1 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {MONTH_LABELS.map((monthName, index) => (
                <option key={monthName} value={index}>{monthName}</option>
              ))}
            </select>
            <span className="sr-only" id={`date-range-year-${side}`}>Year</span>
            <YearDropdown
              year={month.getFullYear()}
              years={years}
              onChange={(year) => updateVisibleMonth(side, year, month.getMonth())}
            />
          </div>
          {side === "right" ? (
            <button
              type="button"
              onClick={() => setFirstMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="rounded-lg border border-border p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
              aria-label="Next month"
            >
              <FiChevronRight size={16} />
            </button>
          ) : (
            <span className="w-9" />
          )}
        </div>

        <div className="grid grid-cols-7 grid-rows-[repeat(7,2.25rem)] text-center">
          {WEEKDAY_LABELS.map((weekday) => (
            <span key={weekday} className="grid place-items-center text-xs font-medium text-ink-muted">
              {weekday}
            </span>
          ))}
          {monthGrid.map((day) => {
            const inCurrentMonth = day.getMonth() === month.getMonth();
            const isStart = inCurrentMonth && start ? isSameDay(day, start) : false;
            const isEnd = inCurrentMonth && end ? isSameDay(day, end) : false;
            const inRange = Boolean(inCurrentMonth && start && end && day > start && day < end);
            const isToday = inCurrentMonth && isSameDay(day, startOfDay(new Date()));
            const disabled = isDisabled(day);

            return (
              <button
                key={toISODate(day)}
                type="button"
                disabled={disabled}
                aria-pressed={isStart || isEnd}
                onClick={() => selectDay(day)}
                className={`mx-auto grid size-8 place-items-center rounded-lg text-sm transition-colors
                  ${!inCurrentMonth ? "text-ink-muted/40" : "text-ink"}
                  ${disabled ? "cursor-not-allowed opacity-30" : "hover:bg-surface-tint"}
                  ${inRange ? "rounded-none bg-primary/10" : ""}
                  ${isStart || isEnd ? "bg-primary text-white hover:bg-primary" : ""}
                  ${isToday && !isStart && !isEnd ? "font-semibold text-primary" : ""}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  const displayValue = startDate && endDate
    ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
    : startDate
      ? `${formatDisplayDate(startDate)} - Select end date`
      : "";
  const startLabel = formatLongDate(draft.startDate);
  const endLabel = formatLongDate(draft.endDate);
  const dayCount = start && end
    ? Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    : 0;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}

      <button
        type="button"
        onClick={() => (isOpen ? closePicker() : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`flex w-full items-center gap-2.5 rounded-xl border bg-surface px-3 py-2.5 text-left text-sm
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30
          ${error ? "border-danger focus:border-danger" : "border-border focus:border-primary"}`}
      >
        <FiCalendar size={17} className="shrink-0 text-ink-muted" />
        <span className={displayValue ? "text-ink" : "text-ink-muted/70"}>
          {displayValue || placeholder}
        </span>
      </button>

      {error && <p className="mt-1.5 text-caption text-danger">{error}</p>}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose a date range"
          style={{ width: `${popupWidth}px` }}
          className="absolute left-0 z-30 mt-2 flex h-[26rem] max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-xl border border-border bg-surface text-ink shadow-floating"
        >
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <nav
              ref={presetNavRef}
              aria-label="Date range presets"
              className="flex max-h-16 shrink-0 gap-1 overflow-x-auto border-b border-border p-3 sm:max-h-none sm:min-h-0 sm:w-44 sm:flex-col sm:gap-0.5 sm:overflow-x-hidden sm:overflow-y-auto sm:overscroll-y-contain sm:border-b-0 sm:border-r [scrollbar-color:var(--color-primary-light)_transparent] [scrollbar-width:thin]"
            >
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.id)}
                  aria-pressed={activePreset === preset.id}
                  className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors
                    ${activePreset === preset.id
                      ? "bg-surface-tint font-medium text-primary"
                      : "text-ink hover:bg-surface-tint"}`}
                >
                  {preset.label}
                </button>
              ))}
            </nav>

            <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 content-start divide-y divide-border overflow-y-auto sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:overflow-visible [scrollbar-color:var(--color-primary-light)_transparent] [scrollbar-width:thin]">
              {renderCalendar(firstMonth, "left")}
              <div className="hidden min-h-0 sm:block">
                {renderCalendar(secondMonth, "right")}
              </div>
            </div>
          </div>

          <footer className="flex shrink-0 flex-col gap-3 border-t border-border bg-surface px-4 py-3 sm:min-h-20 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-muted">Selected dates</p>
              <p className="mt-0.5 truncate text-sm font-medium text-ink" aria-live="polite">
                {startLabel && endLabel
                  ? `${startLabel} - ${endLabel}  (${dayCount} ${dayCount === 1 ? "day" : "days"})`
                  : startLabel
                    ? `${startLabel} - Select end date`
                    : "Choose a start and end date"}
              </p>
            </div>
            <div className="flex shrink-0 justify-end gap-2">
              <button
                type="button"
                onClick={closePicker}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-tint"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyRange}
                disabled={!draft.startDate || !draft.endDate}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
