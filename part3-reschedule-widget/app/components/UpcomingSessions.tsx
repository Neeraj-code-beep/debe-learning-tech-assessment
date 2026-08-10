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
      <section
        aria-labelledby="upcoming-sessions-heading"
        className="grid gap-5 md:grid-cols-3"
      >
        <h2 id="upcoming-sessions-heading" className="sr-only">
          Upcoming tutoring sessions
        </h2>

        {upcomingList.map((session: Session) => (
          <SessionCard
            key={session.id}
            session={session}
            onRequestReschedule={setSelectedSession}
          />
        ))}
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
