# Session Reschedule Widget

This is the Part 3 implementation for the Debe Learning technical assessment. It provides a responsive, accessible session-rescheduling experience for parents in a tutoring portal.

## Overview

Parents can view their upcoming tutoring sessions and trigger a modal dialog to reschedule an appointment. Inside the reschedule dialog, parents select a new date, time, and reason for rescheduling while seeing clear validation feedback. Submissions execute through an asynchronous request handler with inline loading, error handling, and confirmation states.

## Key Features

- **Upcoming Session Display:** Visual card list rendering upcoming sessions with subject, teacher name, local date/time block, and status indicators (`confirmed`, `pending`, `scheduled`).
- **Reschedule Dialog:** Accessible modal overlay (`role="dialog"`, `aria-modal="true"`) for picking a new appointment date and time.
- **Date/Time Selection:** Native HTML date and time inputs formatted for the parent's local timezone and serialized to UTC ISO strings.
- **Past-Time Validation:** Prevents selecting dates or times in the past via input bounds (`min`) and validation rules.
- **Minimum 2-Hour Notice Validation:** Enforces a minimum 2-hour lead time before a rescheduled session to respect teacher notice requirements.
- **Slot Conflict Validation:** Prevents requesting a rescheduled time identical to the existing appointment slot.
- **Reschedule Reason Selection:** Required reason dropdown supporting "Conflict", "Illness", "Time zone", and "Other".
- **Loading & Error Handling:** Displays inline loading states ("Submitting…"), disables submission while processing, and handles server/network error messages.
- **Successful Feedback State:** Renders a visual confirmation state upon successful reschedule submission.
- **Responsive & Accessible Design:** Clean layout supporting mobile screens, keyboard interaction, overlay backdrop dimming, and screen-reader heading hierarchy.

## Technical Implementation

Built using Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

- `app/components/UpcomingSessions.tsx`: Parent container rendering the session list and managing modal selection state.
- `app/components/SessionCard.tsx`: Individual session card component displaying local date blocks, appointment details, status badges, and trigger actions.
- `app/components/RescheduleDialog.tsx`: Modal component handling form inputs, client-side validation, submit actions, loading indicators, and success confirmation.
- `app/functions/requestReschedule.ts`: Asynchronous mock API function simulating network requests and backend validation logic.
- `app/lib/time.ts`: Date and time utilities (`formatLocalDateTime`, `toUtcIso`, `isPastTime`, `isWithinTwoHourWindow`, `todayLocalDate`).
- `app/types/session.ts`: TypeScript interfaces and union types for sessions, reschedule requests, and status definitions.
- `app/page.tsx` & `app/layout.tsx`: Portal page container and root layout configuration.

## Validation Rules

The application enforces the following rescheduling rules:

1. **Past Time Prevention:** The selected date and time must be in the future (`isPastTime`).
2. **2-Hour Minimum Lead Time:** The new appointment time must be at least 2 hours from the current time (`isWithinTwoHourWindow`).
3. **Different Slot Requirement:** The new time slot cannot match the existing session datetime string (`newSlot !== existingSlot`).
4. **Reschedule Reason Required:** A valid reschedule reason must be selected from the predefined dropdown options.

## Project Structure

```
part3-reschedule-widget/
├── app/
│   ├── components/
│   │   ├── RescheduleDialog.tsx
│   │   ├── SessionCard.tsx
│   │   └── UpcomingSessions.tsx
│   ├── data/
│   │   └── sessions.ts
│   ├── functions/
│   │   └── requestReschedule.ts
│   ├── lib/
│   │   └── time.ts
│   ├── types/
│   │   └── session.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── package.json
└── README.md
```

## Getting Started

To run the project locally:

```bash
# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Verification

To verify code quality and build success:

```bash
# Check TypeScript types (from root assessment directory)
npm run typecheck

# Build the Next.js production bundle
npm run build
```

## Assessment Scope

Part 3 focuses on implementing and validating the session rescheduling experience while maintaining the provided project structure and UI requirements.
