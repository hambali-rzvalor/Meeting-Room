# 🚀 Project Blueprint: Modern Meeting Room Booking System

## 1. Technical Stack

* **Framework:** Next.js 16 (App Router)
* **Database:** Neon PostgreSQL (Serverless)
* **ORM:** Drizzle ORM
* **Styling:** Tailwind CSS + Shadcn/UI
* **Animations:** Framer Motion (Modern, Fluid, High-end feel)
* **Validation:** Zod + React Hook Form

---

## 2. Database Schema (ERD) - Drizzle Implementation

Define the following tables and relationships in `schema.ts`:

### **Tabel: `users**`

* `id`: `uuid().primaryKey().defaultRandom()`
* `name`: `text().notNull()`
* `email`: `text().unique().notNull()`
* `role`: `text()` (Enums: 'admin', 'employee')
* `image`: `text()`

### **Tabel: `rooms**`

* `id`: `uuid().primaryKey().defaultRandom()`
* `name`: `text().notNull()`
* `capacity`: `integer().notNull()`
* * `location`: `text()`


* `imageUrl`: `text()`
* `isActive`: `boolean().default(true)`

### **Tabel: `bookings**`

* `id`: `uuid().primaryKey().defaultRandom()`
* `userId`: `uuid().references(() => users.id)`
* `roomId`: `uuid().references(() => rooms.id)`
* `startTime`: `timestamp().notNull()`
* `endTime`: `timestamp().notNull()`
* `purpose`: `text()`
* `status`: `text()` (Enums: 'pending', 'confirmed', 'cancelled')

---

## 3. Business Logic: Anti-Conflict Validation

To prevent double-booking, implement the **Overlap Algorithm** in a Server Action:

**Logic:** A conflict exists if:
`New_Booking_Start < Existing_Booking_End` **AND** `New_Booking_End > Existing_Booking_Start`

**Drizzle Query Example:**

```typescript
const conflict = await db.select().from(bookings).where(
  and(
    eq(bookings.roomId, targetRoomId),
    eq(bookings.status, 'confirmed'),
    lt(bookings.startTime, inputEndTime),
    gt(bookings.endTime, inputStartTime)
  )
);

```

---

## 4. Use Case Scenarios (UCS)

| Actor | Action | Main Flow | Exception / Validation |
| --- | --- | --- | --- |
| **Employee** | **Book Room** | Select Room -> Pick Date/Time -> Input Purpose -> Submit. | If `isConflict`, show "Room occupied" with a shake animation. |
| **Employee** | **View Schedule** | Access "My Bookings" dashboard. | Show empty state with animation if no bookings found. |
| **Admin** | **Manage Rooms** | Add, Edit, or Delete room data via Admin Panel. | Cannot delete a room that has active "Confirmed" bookings. |
| **Admin** | **Approve/Reject** | Review "Pending" bookings and update status. | Auto-reject other overlapping "Pending" requests once one is "Confirmed". |

---

## 5. UI/UX & Modern Animations

* **Entrance:** Staggered list animations for room cards using `framer-motion`.
* **Feedback:** Use **Sonner Toast** for notifications. If a booking fails due to conflict, trigger a "Shake" effect on the form.
* **Loading:** Shimmer/Skeleton screens for data fetching.
* **Transitions:** Page-level fade-in/out transitions.

---

## 6. Directory Structure

```text
├── src/
│   ├── app/              # App Router (Layouts & Pages)
│   ├── components/       # Shared UI (Shadcn + Framer Motion)
│   ├── db/               # Connection & Schema (Drizzle + Neon)
│   ├── lib/              # Utils & Overlap Logic
│   ├── actions/          # Server Actions (CRUD & Validation)
│   └── hooks/            # Custom hooks for UI state
