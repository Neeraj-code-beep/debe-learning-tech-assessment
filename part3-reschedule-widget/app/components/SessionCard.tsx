"use client";

import { Session } from "@/app/types/session";
import { formatLocalDateTime } from "@/app/lib/time";

interface SessionCardProps {
  session: Session;
  onRequestReschedule: (session: Session) => void;
}

export default function SessionCard({
  session,
  onRequestReschedule,
}: SessionCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {session.subject}
        </h3>
        <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium capitalize text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          {session.status}
        </span>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Teacher:
        </span>{" "}
        {session.teacherName}
      </p>

      {/*
        Display time in the parent's LOCAL timezone.
        The underlying value is UTC; formatLocalDateTime converts it
        using Intl.DateTimeFormat so the parent sees their wall-clock time.
      */}
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Date &amp; Time:
        </span>{" "}
        <span suppressHydrationWarning>{formatLocalDateTime(session.datetime)}</span>
      </p>

      <button
        type="button"
        onClick={() => onRequestReschedule(session)}
        className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      >
        Request Reschedule
      </button>
    </div>
  );
}
