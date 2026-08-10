import { Session } from "@/app/types/session";

/**
 * Mock session data. Datetimes are UTC ISO strings.
 * The UI converts these to the parent's local timezone for display.
 */
export const sessions: Session[] = [
  {
    id: "s1",
    subject: "Algebra II",
    teacherName: "Ms. Rivera",
    datetime: "2026-08-12T13:30:00.000Z",
    status: "confirmed",
  },
  {
    id: "s2",
    subject: "Biology",
    teacherName: "Mr. Chen",
    datetime: "2026-08-14T17:00:00.000Z",
    status: "confirmed",
  },
  {
    id: "s3",
    subject: "English Literature",
    teacherName: "Dr. Patel",
    datetime: "2026-08-16T20:00:00.000Z",
    status: "pending",
  },
];

export const upcomingSessions = sessions;
