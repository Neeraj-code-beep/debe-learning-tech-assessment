export type SessionStatus = "confirmed" | "pending" | "scheduled";

export type RescheduleReason =
  | "Conflict"
  | "Illness"
  | "Time zone"
  | "Other";

export interface Session {
  id: string;
  subject: string;
  teacherName: string;
  datetime: string;
  status: SessionStatus;
}

export interface RescheduleRequest {
  sessionId: string;
  existingSlot: string;
  newSlot: string;
  reason: RescheduleReason;
}

export interface RescheduleResponse {
  success: boolean;
  error?: string;
}
