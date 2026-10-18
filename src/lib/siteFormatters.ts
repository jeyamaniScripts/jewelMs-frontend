import type { SiteSettingsValues } from "@/constants/siteSettings";

export interface SiteFormatters {
  amount: (value: number | null | undefined) => string;
  weight: (value: number | null | undefined) => string;
  quantity: (value: number | null | undefined) => string;
  date: (value: string | Date | null | undefined) => string;
  dateTime: (value: string | Date | null | undefined) => string;
}

function decimalPlaces(value: string, fallback: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) {
    return Number(fallback);
  }
  return parsed;
}

function finiteNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatDateValue(
  value: string | Date | null | undefined,
  settings: SiteSettingsValues,
): string {
  if (value === null || value === undefined || value === "") return "—";

  const dateOnly = typeof value === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 12))
    : value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const locale = settings.language || "en-IN";
  const timeZone = settings.timezone || "UTC";
  const dateParts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: settings.dateFormat === "dd MMM yyyy" ? "short" : "2-digit",
    year: "numeric",
    timeZone,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((item) => item.type === type)?.value ?? "";
  const day = part("day");
  const month = part("month");
  const year = part("year");

  switch (settings.dateFormat) {
    case "MM/dd/yyyy":
      return `${month}/${day}/${year}`;
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`;
    case "dd MMM yyyy":
      return `${day} ${month} ${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function createSiteFormatters(settings: SiteSettingsValues): SiteFormatters {
  const locale = settings.language || "en-IN";
  const amountDecimals = decimalPlaces(settings.amountDecimals, "2");
  const weightDecimals = decimalPlaces(settings.weightDecimals, "3");
  const quantityDecimals = decimalPlaces(settings.quantityDecimals, "0");

  return {
    amount: (value) => {
      const number = finiteNumber(value);
      if (number === null) return "—";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: settings.currency || "INR",
        minimumFractionDigits: amountDecimals,
        maximumFractionDigits: amountDecimals,
      }).format(number);
    },
    weight: (value) => {
      const number = finiteNumber(value);
      if (number === null) return "—";
      return `${new Intl.NumberFormat(locale, {
        minimumFractionDigits: weightDecimals,
        maximumFractionDigits: weightDecimals,
      }).format(number)}g`;
    },
    quantity: (value) => {
      const number = finiteNumber(value);
      if (number === null) return "—";
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: quantityDecimals,
        maximumFractionDigits: quantityDecimals,
      }).format(number);
    },
    date: (value) => formatDateValue(value, settings),
    dateTime: (value) => {
      if (value === null || value === undefined || value === "") return "—";
      const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
      if (Number.isNaN(date.getTime())) return "—";
      const time = new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: settings.timeFormat === "12-hour",
        timeZone: settings.timezone || "UTC",
      }).format(date);
      return `${formatDateValue(value, settings)} ${time}`;
    },
  };
}
