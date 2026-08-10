"use client";

import { FormEvent, useState } from "react";
import { requestReschedule } from "../functions/requestReschedule";
import {
  RescheduleReason,
  RescheduleResponse,
  Session,
} from "@/app/types/session";
import {
  formatLocalDateTime,
  isPastTime,
  isWithinTwoHourWindow,
  todayLocalDate,
  toUtcIso,
} from "@/app/lib/time";

interface RescheduleDialogProps {
  session: Session;
  onClose: () => void;
}

const reasons: RescheduleReason[] = [
  "Conflict",
  "Illness",
  "Time zone",
  "Other",
];

export default function RescheduleDialog({
  session,
  onClose,
}: RescheduleDialogProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState<RescheduleReason>("Conflict");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedUtc = date && time ? toUtcIso(date, time) : "";
  const isPast = selectedUtc ? isPastTime(selectedUtc) : false;
  const tooSoon = selectedUtc ? isWithinTwoHourWindow(selectedUtc) : false;
  const sameSlot = selectedUtc.length > 0 && selectedUtc === session.datetime;

  /**
   * Frontend validation runs BEFORE calling requestReschedule.
   * This provides instant user feedback.
   */
  function validate(): string | null {
    if (!date || !time) {
      return "Please select both a date and time.";
    }

    if (!selectedUtc) {
      return "Please select a valid date and time.";
    }

    const selectedDate = new Date(selectedUtc);

    if (Number.isNaN(selectedDate.getTime())) {
      return "Invalid date or time.";
    }

    if (isPast) {
      return "The selected time must be in the future.";
    }

    if (sameSlot) {
      return "The selected time is the same as the current session.";
    }

    if (tooSoon) {
      return "Please choose a time at least 2 hours from now.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result: RescheduleResponse = await requestReschedule({
        sessionId: session.id,
        existingSlot: session.datetime,
        newSlot: selectedUtc,
        reason,
      });

      if (!result.success) {
        setError(result.error ?? "Unable to reschedule session.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-6">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Reschedule session
          </p>

          <h2
            id="reschedule-title"
            className="mt-1 text-2xl font-bold text-slate-900 dark:text-zinc-100"
          >
            {session.subject}
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Teacher: <span className="font-medium text-slate-700 dark:text-zinc-300">{session.teacherName}</span>
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Current time:{" "}
            <span suppressHydrationWarning className="font-medium text-slate-700 dark:text-zinc-300">
              {formatLocalDateTime(session.datetime)}
            </span>
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div
              className="rounded-xl bg-emerald-50 p-4 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              role="status"
            >
              ✓ Reschedule request submitted successfully.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                New date
              </label>

              <input
                id="date"
                type="date"
                min={todayLocalDate()}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setError("");
                }}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                New time
              </label>

              <input
                id="time"
                type="time"
                value={time}
                onChange={(event) => {
                  setTime(event.target.value);
                  setError("");
                }}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              />

              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
                Times are shown in your local browser timezone and converted to UTC for submission.
              </p>

              {isPast && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  The selected time is in the past. Please select a future time.
                </p>
              )}

              {!isPast && tooSoon && (
                <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                  Please choose a time at least 2 hours from now.
                </p>
              )}

              {sameSlot && (
                <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                  Please choose a different time from the current session.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reason"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                Reason
              </label>

              <select
                id="reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as RescheduleReason)
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {reasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !date || !time || isPast || tooSoon || sameSlot}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
              >
                {loading ? "Submitting..." : "Request Reschedule"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}