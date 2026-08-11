/**
 * Time-conversion helpers.
 *
 * WHY LOCAL vs UTC?
 * -----------------
 * Parents see session times in their LOCAL browser timezone so the
 * displayed time matches their wall clock. However all stored and
 * transmitted datetimes use UTC ISO strings so the server (or any
 * future real Cloud Function) processes a single canonical
 * representation regardless of where the parent is located.
 *
 * The conversion boundary lives here: UI calls `formatLocalDateTime`
 * to display, and `toUtcIso` to convert a chosen local date+time
 * back to UTC before sending it to requestReschedule.
 */

/**
 * Format a UTC ISO string into a human-friendly local date+time
 * using the browser's timezone via `Intl.DateTimeFormat`.
 */
export function formatLocalDateTime(utcIso: string): string {
  const date = new Date(utcIso);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

/**
 * Build a UTC ISO string from separate local date ("YYYY-MM-DD")
 * and local time ("HH:MM") strings.
 *
 * The `new Date(year, month, day, hours, minutes)` constructor
 * interprets arguments in the browser's local timezone, so the
 * resulting `.toISOString()` is the correct UTC equivalent.
 */
export function toUtcIso(localDate: string, localTime: string): string {
  const [year, month, day] = localDate.split("-").map(Number);
  const [hours, minutes] = localTime.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

/**
 * Returns `true` when the given UTC ISO string is in the past.
 */
export function isPastTime(utcIso: string): boolean {
    return new Date(utcIso).getTime() <= Date.now();
}

/**
 * Returns true when the selected time is less than 2 hours from now.
 *
 * WHY THE 2-HOUR RULE?
 * --------------------
 * A minimum lead time prevents last-minute reschedules that would
 * leave the teacher without enough notice to adjust their schedule.
 * This check runs on BOTH the frontend (for instant UX feedback)
 * and inside requestReschedule (to protect the business rule from
 * clients that bypass the UI).
 */
export function isWithinTwoHourWindow(utcIso: string): boolean {
  const selectedTime = new Date(utcIso).getTime();
  const minimumAllowedTime = Date.now() + 2 * 60 * 60 * 1000;
  return selectedTime < minimumAllowedTime;
}

/**
 * Returns a "YYYY-MM-DD" string for today in the browser's local
 * timezone — used as the `min` attribute on the date picker so
 * past dates are not selectable.
 */
export function todayLocalDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
