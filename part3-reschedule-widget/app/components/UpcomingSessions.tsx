"use client";

import { useState } from "react";
import { sessions } from "@/app/data/sessions";
import { Session } from "@/app/types/session";
import SessionCard from "./SessionCard";
import RescheduleDialog from "./RescheduleDialog";

export default function UpcomingSessions() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const upcomingList = sessions.slice(0, 3);

  return (
    <>
      <section aria-labelledby="upcoming-sessions-heading">
        {/* Section header */}
        <div className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
          <h2
            id="upcoming-sessions-heading"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            Upcoming Sessions
          </h2>
          <span className="text-xs text-text-tertiary">
            {upcomingList.length} scheduled
          </span>
        </div>

        {/* Appointment list */}
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {upcomingList.map((session: Session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRequestReschedule={setSelectedSession}
            />
          ))}
        </div>
      </section>

      {selectedSession && (
        <RescheduleDialog
          key={selectedSession.id}
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}
