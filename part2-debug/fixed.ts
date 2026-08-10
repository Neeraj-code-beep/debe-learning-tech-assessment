import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall, CallableContext } from 'firebase-functions/v1/https';
import { z } from 'zod';

initializeApp();

const db = getFirestore();

interface BookingRequest {
  teacherId: string;
  slot: string;
  subject: string;
}

const bookingRequestSchema = z.object({
  teacherId: z.string().min(1),
  slot: z.string().datetime(),
  subject: z.string().min(1),
});

export const bookSession = onCall(
  async (data: BookingRequest, context: CallableContext) => {
    // The client cannot be trusted to provide the student's identity.
    // Using data.studentId would allow an authenticated user to create
    // a booking on behalf of another student. The authenticated UID
    // must be used as the source of identity.
    if (!context.auth) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    // TypeScript interfaces only provide compile-time checking and do
    // not validate data received from a client at runtime. Invalid or
    // malicious input could otherwise reach the database.
    const validationResult = bookingRequestSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Invalid booking request',
      };
    }

    const { teacherId, slot, subject } = validationResult.data;

    // The authenticated UID is the trusted source of the student's
    // identity instead of accepting a studentId supplied by the client.
    const studentId = context.auth.uid;

    const teacherRef = db.collection('teachers').doc(teacherId);

    // Firestore queries are asynchronous. Without await, existing would
    // be a Promise instead of the resolved query result, so the duplicate
    // booking check would execute before Firestore returned the documents.
    const existing = await teacherRef
      .collection('bookings')
      .where('slot', '==', slot)
      .get();

    if (!existing.empty) {
      return {
        success: false,
        message: 'Slot already booked',
      };
    }

    const booking = {
      studentId,
      teacherId,
      slot,
      subject,
      status: 'confirmed',
      createdAt: FieldValue.serverTimestamp(),
    };

    // The original code checked the teacher's bookings subcollection but
    // wrote to a different top-level collection. This mismatch meant the
    // duplicate check did not protect the collection where the booking
    // was actually stored.
    await teacherRef.collection('bookings').add(booking);

    return {
      success: true,
    };
  },
);
