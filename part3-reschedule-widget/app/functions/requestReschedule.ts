import {
  RescheduleRequest,
  RescheduleResponse,
} from "@/app/types/session";
import { isWithinTwoHourWindow } from "@/app/lib/time";

/**
 * Locally-mocked Firebase Cloud Function: requestReschedule
 *
 * This simulates a server-side endpoint. In production it would be
 * deployed as an actual Cloud Function. The mock adds a small
 * artificial delay to exercise the UI's loading state.
 *
 * VALIDATION (duplicated from the frontend on purpose):
 * -----------------------------------------------------
 * The frontend validates the 2-hour rule and same-slot rule for
 * immediate UX feedback, but a real client could call this function
 * directly (e.g. via cURL). Re-validating here protects the
 * business rule server-side so no invalid reschedule can slip through.
 */
export async function requestReschedule(
  req: RescheduleRequest
): Promise<RescheduleResponse> {
  // Simulate network latency (300–600 ms)
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));

  const newDate = new Date(req.newSlot);

  // 1. Is the date parseable?
  if (isNaN(newDate.getTime())) {
    return { success: false, error: "Invalid date." };
  }

  // 2. Is the new slot in the past?
  if (newDate.getTime() <= Date.now()) {
    return { success: false, error: "The new time must be in the future." };
  }

  // 3. Is the new slot the same as the existing slot?
  if (req.newSlot === req.existingSlot) {
    return {
      success: false,
      error: "The new time is the same as the current session time.",
    };
  }

  // 4. Does the new slot respect the 2-hour lead-time policy?
  //    This is the critical server-side guard: even if the frontend
  //    check is bypassed, this prevents too-late reschedules.
  if (isWithinTwoHourWindow(req.newSlot)) {
    return {
      success: false,
      error:
        "The new time must be at least 2 hours from now to give the teacher adequate notice.",
    };
  }

  // All checks passed
  return { success: true };
}
