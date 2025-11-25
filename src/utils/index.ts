import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// DATE/TIME UTILITIES
// =============================================================================
// IMPORTANT: The backend is timezone-agnostic and expects ISO 8601 UTC strings.
// These utilities handle conversion between local time and UTC.
// =============================================================================

/**
 * Convert a local Date to ISO 8601 UTC string for API requests
 *
 * @example
 * toUTCString(new Date()) // "2025-11-24T16:00:00.000Z"
 */
export function toUTCString(date: Date): string {
  return date.toISOString();
}

/**
 * Convert an ISO 8601 UTC string from API to a local Date object
 *
 * @example
 * fromUTCString("2025-11-24T16:00:00.000Z") // Date in local timezone
 */
export function fromUTCString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Get start and end of a day in UTC format for API queries
 * Takes a local date and returns the UTC range that represents that day
 *
 * @example
 * // User in Manila (UTC+8) querying for "Nov 24, 2025"
 * getDateRangeForDay(new Date("2025-11-24"))
 * // Returns:
 * // {
 * //   startDate: "2025-11-23T16:00:00.000Z", // Nov 24 00:00 Manila time
 * //   endDate: "2025-11-24T15:59:59.999Z"    // Nov 24 23:59 Manila time
 * // }
 */
export function getDateRangeForDay(date: Date): { startDate: string; endDate: string } {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };
}

/**
 * Get start and end of a date range in UTC format for API queries
 *
 * @example
 * getDateRange(new Date("2025-11-01"), new Date("2025-11-30"))
 */
export function getDateRange(
  startDate: Date,
  endDate: Date
): { startDate: string; endDate: string } {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

/**
 * Format a UTC ISO string to a localized date string for display
 *
 * @example
 * formatLocalDate("2025-11-24T16:00:00.000Z") // "Nov 24, 2025"
 * formatLocalDate("2025-11-24T16:00:00.000Z", { weekday: "long" }) // "Monday, Nov 24, 2025"
 */
export function formatLocalDate(isoString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(isoString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return date.toLocaleDateString("en-US", defaultOptions);
}

/**
 * Format a UTC ISO string to a localized time string for display
 *
 * @example
 * formatLocalTime("2025-11-24T16:00:00.000Z") // "12:00 AM" (if user is in UTC+8)
 */
export function formatLocalTime(isoString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(isoString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options,
  };

  return date.toLocaleTimeString("en-US", defaultOptions);
}

/**
 * Format a UTC ISO string to a localized date and time string for display
 *
 * @example
 * formatLocalDateTime("2025-11-24T16:00:00.000Z")
 * // "Nov 24, 2025, 12:00 AM" (if user is in UTC+8)
 */
export function formatLocalDateTime(
  isoString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(isoString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options,
  };

  return date.toLocaleString("en-US", defaultOptions);
}

/**
 * Get the user's timezone identifier
 *
 * @example
 * getUserTimezone() // "Asia/Manila"
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Check if a string is a valid ISO 8601 date string
 */
export function isValidISOString(str: string): boolean {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) {
    return false;
  }
  const date = new Date(str);
  return !isNaN(date.getTime());
}

/**
 * Get today's date range in UTC for API queries
 */
export function getTodayRange(): { startDate: string; endDate: string } {
  return getDateRangeForDay(new Date());
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, "second");
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(-diffInMinutes, "minute");
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(-diffInHours, "hour");
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(-diffInDays, "day");
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(-diffInMonths, "month");
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, "year");
}

// =============================================================================
// GENERAL UTILITIES
// =============================================================================

/**
 * Format date to locale string
 * @deprecated Use formatLocalDate instead for UTC strings from API
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Date(date).toLocaleDateString("en-US", defaultOptions);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = "PHP"): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check if we're running on the server
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Check if we're running on the client
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}
