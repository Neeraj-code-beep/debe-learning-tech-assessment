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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-overlay px-4 py-12 sm:items-center sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-title"
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-surface shadow-lg">
        {/* Header */}
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-text-tertiary">
            Reschedule Session
          </p>

          <h2
            id="reschedule-title"
            className="heading-serif mt-1 text-xl text-text-primary"
          >
            {session.subject}
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            with{" "}
            <span className="font-medium text-text-primary">
              {session.teacherName}
            </span>
          </p>

          <div className="mt-3 rounded-md bg-bg px-3 py-2">
            <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-text-tertiary">
              Current appointment
            </span>
            <p
              className="mt-0.5 text-sm font-medium text-text-primary"
              suppressHydrationWarning
            >
              {formatLocalDateTime(session.datetime)}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 sm:px-6">
          {success ? (
            <div className="space-y-4">
              <div
                className="rounded-md border border-status-confirmed/20 bg-status-confirmed-bg px-4 py-3"
                role="status"
              >
                <p className="text-sm font-medium text-status-confirmed">
                  ✓ Reschedule request submitted
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Your request for {session.subject} has been submitted.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-md bg-text-primary px-4 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-text-primary/90"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
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
                  className="input-base"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label
                  htmlFor="time"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
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
                  className="input-base"
                  required
                />

                <p className="mt-1.5 text-[0.6875rem] text-text-tertiary">
                  Times shown in your local timezone · stored as UTC
                </p>

                {/* Inline validation warnings */}
                {isPast && (
                  <p className="mt-2 rounded-md bg-status-error-bg px-3 py-2 text-xs font-medium text-status-error">
                    The selected time is in the past. Please select a future
                    time.
                  </p>
                )}

                {!isPast && tooSoon && (
                  <p className="mt-2 rounded-md bg-status-pending-bg px-3 py-2 text-xs font-medium text-status-pending">
                    Please choose a time at least 2 hours from now.
                  </p>
                )}

                {sameSlot && (
                  <p className="mt-2 rounded-md bg-status-pending-bg px-3 py-2 text-xs font-medium text-status-pending">
                    Please choose a different time from the current session.
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label
                  htmlFor="reason"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
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
                  className="input-base"
                >
                  {reasons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Server-returned error */}
              {error && (
                <div
                  className="rounded-md border border-status-error/20 bg-status-error-bg px-3 py-2 text-xs text-status-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading || !date || !time || isPast || tooSoon || sameSlot
                  }
                  className="flex-1 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Submitting…" : "Request Reschedule"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}