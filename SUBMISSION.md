# Debe Learning — Tech Intern Assessment

## Part 1 — GitHub Portfolio Walkthrough

### GitHub Profile

https://github.com/Neeraj-code-beep

---

### Repository 1 — HealthSphere

**Repository:** [HealthSphere](https://github.com/Neeraj-code-beep/HealthSphere)

#### Problem

Healthcare applications often present complex medical metrics and dense clinical reports without providing accessible, real-time guidance or intelligent context for patients. HealthSphere addresses this by providing an AI-driven personal health management system that processes unstructured medical documents (like blood tests and diagnostic reports) via OCR and enables interactive, context-aware AI clinical chats with server-side streaming responses.

#### My Contributions

* **Implemented Server-Side Gemini Streaming via SSE:** Built `server/services/gemini/geminiService.js` to process AI prompts using Google Gemini 1.5 Flash and stream chunks back to the client using Server-Sent Events (SSE) via `express-sse-ts`. This reduced perceived latency by rendering model responses immediately as they generate rather than forcing the user to wait for the complete payload (`6688496`).
* **Built Contextual AI Health Memory Architecture:** Developed `server/services/ai/aiService.js` and the `AIMemory` Mongoose schema to extract and persist key user health traits (such as chronic conditions, allergies, and ongoing medications) from chat sessions. This context is injected into downstream prompt templates, ensuring long-term personalized recommendations without requiring the patient to re-input their medical background (`d693f3f`).
* **Hardened Authentication and User Data Isolation:** Refactored `server/controllers/chatController.js` and Express router middlewares to strictly scope chat sessions, medical report OCR records, and AI history to the authenticated user ID (`req.user._id`), preventing unauthorized cross-user data access and securing socket listeners (`407193c`).
* **Developed Production Medical Report OCR & Vision Processing Pipeline:** Authored `server/services/ocr/ocrService.js` and backend API handlers to process uploaded medical diagnostic PDFs and images, extracting clinical metrics and integrating them directly into the patient's digital health record (`5968b02`, `5e95a31`).

#### Design Decision I Would Reconsider

Today, I would reconsider keeping context memory extraction inside the main HTTP API request-response lifecycle during chat sessions because relying on synchronous inline LLM calls to update `AIMemory` increases response latency and introduces unnecessary points of failure for the primary streaming response. At the time, performing memory extraction directly within `aiService.js` made sense because it was the simplest way to ensure immediate context update consistency without introducing background task queues or worker threads like BullMQ/Redis to the stack.

---

### Repository 2 — PulseOS

**Repository:** [PulseOS](https://github.com/Neeraj-code-beep/PulseOS)

#### Problem

Standard productivity and task management applications often operate as static to-do lists, lacking real-time focus tools, intelligent task estimation, and automated scheduling tailored to a user's actual daily workload. PulseOS functions as a real-time productivity operating system that combines structured task management with automated AI breakdown, dynamic time estimation, focus timer sessions, and productivity analytics.

#### My Contributions

* **Engineered Multi-Tier Task Management & Auth Architecture:** Built the express backend API with JWT authentication middleware (`backend/src/middleware/auth.middleware.js`), scoping task creation, filtering, update operations, and focus session records strictly to the logged-in user (`2727b90`, `22d52ee`).
* **Architected Real-Time WebSocket & Reminder Notification Engine:** Built `backend/src/sockets/socket.js` and `backend/src/scheduler/reminder.scheduler.js` using Socket.IO and Node-cron to stream instant task updates, session state syncs, and automated due-date notifications directly to active client browsers (`d1ecabf`, `c349ed7`).
* **Developed AI Task Breakdown & Smart Scheduling System:** Built `backend/src/services/ai.service.js` integrating Gemini AI to break down complex tasks into actionable subtasks with automated time estimates and generate daily schedule proposals based on task priority and duration (`8dce1ea`, `716f9bc`).
* **Implemented Productivity Analytics Service:** Designed `backend/src/services/analytics.service.js` to compute productivity metrics, focus session completion rates, and daily task velocity, feeding interactive dashboard components (`9ac36e3`, `a189689`).

#### Design Decision I Would Reconsider

Today, I would reconsider relying on an in-memory Node-cron scheduler for dispatching user notifications because in-memory cron jobs do not persist across process restarts and cannot scale horizontally across multiple node cluster instances. At the time, using `node-cron` inside `reminder.scheduler.js` made sense because it allowed quick, zero-dependency prototyping of due-date triggers without introducing external message brokers or distributed scheduler stores.

---

### Commit History Evidence

Development across both repositories demonstrates clear, non-squashed, incremental progress spanning core architecture setup, feature iteration, security hardening, and documentation alignment:

| Repository | Commit | Date | Contribution | Why it matters |
|---|---|---|---|---|
| HealthSphere | `5f154b1` | 2026-07-13 | Chatbot backend & Express API implementation | Established initial AI routing and server controller foundation |
| HealthSphere | `eb567cf` | 2026-07-17 | Security hardening on chat routes and sockets | Added basic input validation and rate limiting on AI endpoints |
| HealthSphere | `5968b02` | 2026-07-26 | Production OCR fix for medical report processing | Resolved document parsing issues in production build |
| HealthSphere | `6688496` | 2026-08-08 | Server-side Gemini SSE streaming integration | Transformed AI responses from blocking JSON payloads to real-time streams |
| HealthSphere | `d693f3f` | 2026-08-09 | Contextual health memory extraction | Implemented multi-turn patient health profile persistence |
| HealthSphere | `407193c` | 2026-08-11 | Hardened auth middleware & user data isolation | Enforced strict `req.user._id` scoping across sockets and chat routes |
| PulseOS | `1c72dc0` | 2026-03-26 | Initial full-stack repository structure | Created base client/server file layout |
| PulseOS | `d1ecabf` | 2026-08-02 | Real-time reminders & focus session engine | Implemented core timer state management and Socket.IO infrastructure |
| PulseOS | `9ac36e3` | 2026-08-08 | Productivity analytics service foundation | Built backend metrics aggregation pipeline |
| PulseOS | `8dce1ea` | 2026-08-08 | Gemini AI task breakdown integration | Added automated subtask generation via LLM |
| PulseOS | `2727b90` | 2026-08-11 | JWT authentication flow implementation | Secured endpoints with JWT token validation |
| PulseOS | `22d52ee` | 2026-08-11 | User-scoped data ownership enforcement | Ensured users can only access and modify their own tasks |

---

### Reflection

Working on HealthSphere and PulseOS shifted my approach from just building working features to thinking carefully about full-stack system architecture, data security, and latency. I learned that handling real-time features like streaming AI responses or WebSocket events requires proactive boundary validation and data isolation rather than patching security as an afterthought. Today, when designing systems, I focus much more on state separation, proper background job handling for heavy tasks, and predictable user data boundaries.

---

## Part 2 — Debugging Task

### What Was Wrong
1. **Broken Auth & Client Identity Spoofing:** `bookSession` accepted `data.studentId` from the client request payload, allowing any authenticated user to create bookings on behalf of arbitrary students.
2. **Missing Runtime Payload Validation:** The function relied on compile-time TypeScript interfaces (`BookingRequest`) without runtime schema checks, leaving the database vulnerable to invalid or malicious payloads.
3. **Missing `await` on Firestore Async Query:** `db.collection(...).get()` was called without `await`, causing `existing` to evaluate to a pending Promise rather than a query snapshot (`existing.docs` evaluated to `undefined`).
4. **Storage Collection Inconsistency:** The availability check queried `teacherRef.collection('bookings')`, but the write target added the booking to a top-level `db.collection('bookings')` collection.
5. **Client-Side Timestamps & Missing Error Handling:** Used `new Date()` (client timestamp) instead of server timestamps and lacked structured authentication error returns.

### How It Was Fixed
- **Strict Authentication Scoping:** Extracted student identity directly from `context.auth.uid` after enforcing `if (!context.auth) return { success: false, message: 'Authentication required' }`.
- **Runtime Schema Validation:** Added Zod schema validation (`z.object({ teacherId: z.string().min(1), slot: z.string().datetime(), subject: z.string().min(1) })`) with `safeParse`.
- **Awaited Queries & Correct Collection Scoping:** Added `await` on `teacherRef.collection('bookings').where('slot', '==', slot).get()` and saved confirmed bookings back to `teacherRef.collection('bookings')`.
- **Server Timestamp:** Used `FieldValue.serverTimestamp()` for predictable database write time.

### Relevant Files
- `part2-debug/original.ts`
- `part2-debug/fixed.ts`

### Verification Result
Passed type checking (`npm run typecheck`).

---

## Part 3 — Reschedule Widget

### Problem / Requirement
Parents need a simple interface to reschedule their child's upcoming tutoring sessions. The reschedule flow must prevent past-time selection, prevent booking sessions within 2 hours of current time (policy rule), validate reschedule reason selection, enforce proper error states, and reflect instant optimistic/confirmed UI state transitions with responsive and accessible modal interaction.

### Implementation Approach
- **Modular Component Structure:** Built `RescheduleDialog`, `SessionCard`, and `UpcomingSessions` components using standard Next.js App Router patterns and Tailwind styling tokens.
- **Robust Validation Helpers (`app/lib/time.ts`):** Implemented date/time formatting and validation routines:
  - `isPastTime`: Prevents picking past dates/times.
  - `isWithinTwoHours`: Enforces the 2-hour minimum notice restriction before rescheduling.
  - `toUtcIso`: Converts local date and time input strings into UTC ISO representations for API requests.
- **State & Interaction Handling:** Managed modal visibility, form errors, loading spinners, submit disabled states, and successful inline session state updates.

### Validation & UX Behavior
- **Past-Time & 2-Hour Rules:** Displays intuitive error notifications when selecting invalid times.
- **Existing vs New Slot Match:** Prevents selecting the exact same date and time slot as the current session.
- **Reason Required:** Requires selecting a valid reschedule reason from predefined categories ("Conflict", "Illness", "Time zone", "Other").
- **Accessibility & Mobile UX:** Features full keyboard focus management (`Escape` key close), backdrop click dimming, screen-reader headings, and mobile-friendly responsive form inputs.

### Verification Result
Verified with `npx tsc --noEmit` and production build (`npm run build`).

---

## Video Submission

*(If video recordings are required by evaluators, include links below)*

- **Part 1 Walkthrough Video:** `[INSERT_VIDEO_LINK_IF_REQUIRED]`
- **Part 3 Widget Demonstration Video:** `[INSERT_VIDEO_LINK_IF_REQUIRED]`
