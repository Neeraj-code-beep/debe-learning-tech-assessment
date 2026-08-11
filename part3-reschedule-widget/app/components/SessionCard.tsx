"use client";

import { Session } from "@/app/types/session";
import { formatLocalDateTime } from "@/app/lib/time";

interface SessionCardProps {
  session: Session;
  onRequestReschedule: (session: Session) => void;
}

/**
 * Extracts structured date/time parts from a UTC ISO string
 * for the visual date block. Uses Intl formatters so the parent
 * sees their local wall-clock time.
 */
function getDateParts(utcIso: string) {
  const date = new Date(utcIso);
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
  const day = new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat(undefined, { month: "short" }).format(date);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return { weekday, day, month, time };
}

const statusConfig: Record<
  string,
  { label: string; dotClass: string; textClass: string }
> = {
  confirmed: {
    label: "Confirmed",
    dotClass: "bg-status-confirmed",
    textClass: "text-status-confirmed",
  },
  pending: {
    label: "Pending",
    dotClass: "bg-status-pending",
    textClass: "text-status-pending",
  },
  scheduled: {
    label: "Scheduled",
    dotClass: "bg-status-confirmed",
    textClass: "text-status-confirmed",
  },
};

export default function SessionCard({
  session,
  onRequestReschedule,
}: SessionCardProps) {
  const parts = getDateParts(session.datetime);
  const status = statusConfig[session.status] ?? statusConfig.confirmed;

  return (
    <div className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-accent-light/40 sm:items-center sm:gap-5 sm:px-5 sm:py-5">
      {/*
        Date block — the strong visual anchor.
        suppressHydrationWarning because locale-based formatting
        may differ between server and client.
      */}
      <div
        className="flex w-14 shrink-0 flex-col items-center text-center sm:w-16"
        suppressHydrationWarning
      >
        <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-secondary">
          {parts.weekday}
        </span>
        <span className="heading-serif text-2xl leading-tight text-text-primary sm:text-3xl">
          {parts.day}
        </span>
        <span className="text-[0.625rem] font-medium uppercase tracking-wider text-text-secondary">
          {parts.month}
        </span>
        <span className="mt-1 text-xs font-medium text-accent">
          {parts.time}
        </span>
      </div>

      {/* Vertical divider — desktop only */}
      <div className="hidden h-14 w-px bg-border sm:block" />

      {/* Session details */}
      <div className="min-w-0 flex-1">
        <h3 className="heading-serif text-lg leading-snug text-text-primary">
          {session.subject}
        </h3>
        <p className="mt-0.5 text-sm text-text-secondary">
          with {session.teacherName}
        </p>

        {/* Status indicator — small dot + text */}
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${status.dotClass}`}
          />
          <span className={`text-xs font-medium ${status.textClass}`}>
            {status.label}
          </span>
        </div>

        {/*
          Full formatted datetime for screen readers and as
          secondary text reference. Uses formatLocalDateTime which
          converts UTC → browser local via Intl.DateTimeFormat.
        */}
        <p
          className="mt-1 text-[0.6875rem] text-text-tertiary sm:hidden"
          suppressHydrationWarning
        >
          {formatLocalDateTime(session.datetime)}
        </p>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={() => onRequestReschedule(session)}
        className="shrink-0 self-center rounded-md border border-accent/30 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:border-accent hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent/30 sm:px-4 sm:py-2 sm:text-sm"
      >
        Reschedule
        <span className="hidden sm:inline"> →</span>
      </button>
    </div>
  );
}
