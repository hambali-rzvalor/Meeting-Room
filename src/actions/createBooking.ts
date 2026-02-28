import { db } from '@/db';
import { bookings, rooms, users } from '@/db/schema';
import { eq, and, lt, gt } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// Validation Schema
// ============================================================================
export const createBookingSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roomId: z.string().uuid('Invalid room ID'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  purpose: z.string().min(1, 'Purpose is required').max(500, 'Purpose too long'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ============================================================================
// Error Types
// ============================================================================
export type BookingError =
  | { type: 'VALIDATION'; message: string }
  | { type: 'CONFLICT'; message: string }
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'INVALID_TIME'; message: string }
  | { type: 'DATABASE'; message: string };

export type BookingResult =
  | { success: false; error: BookingError }
  | { success: true; data: typeof bookings.$inferSelect };

// ============================================================================
// Overlap Validation Logic
// ============================================================================
/**
 * Checks for booking conflicts using the overlap algorithm:
 * A conflict exists if: New_Start < Existing_End AND New_End > Existing_Start
 */
export async function checkBookingConflict(
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const query = and(
    eq(bookings.roomId, roomId),
    eq(bookings.status, 'confirmed'),
    lt(bookings.startTime, endTime),
    gt(bookings.endTime, startTime)
  );

  const conflicts = await db
    .select()
    .from(bookings)
    .where(query);

  // If excluding a specific booking (for updates), filter it out
  if (excludeBookingId && conflicts.length > 0) {
    return conflicts.some((booking) => booking.id !== excludeBookingId);
  }

  return conflicts.length > 0;
}

// ============================================================================
// Server Action: Create Booking
// ============================================================================
export async function createBooking(
  input: CreateBookingInput
): Promise<BookingResult> {
  // 1. Validate input
  const validation = createBookingSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: {
        type: 'VALIDATION',
        message: validation.error.errors[0]?.message || 'Invalid input',
      },
    };
  }

  const { userId, roomId, startTime, endTime, purpose } = validation.data;

  // 2. Validate time logic
  if (startTime >= endTime) {
    return {
      success: false,
      error: {
        type: 'INVALID_TIME',
        message: 'Start time must be before end time',
      },
    };
  }

  // 3. Check if room exists and is active
  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);

  if (room.length === 0) {
    return {
      success: false,
      error: { type: 'NOT_FOUND', message: 'Room not found' },
    };
  }

  if (!room[0].isActive) {
    return {
      success: false,
      error: { type: 'NOT_FOUND', message: 'Room is not available' },
    };
  }

  // 4. Check if user exists
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return {
      success: false,
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  // 5. Check for booking conflicts (Anti-Conflict Logic)
  const hasConflict = await checkBookingConflict(roomId, startTime, endTime);
  if (hasConflict) {
    return {
      success: false,
      error: {
        type: 'CONFLICT',
        message: 'Room is already booked for the selected time period',
      },
    };
  }

  // 6. Create the booking
  try {
    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId,
        roomId,
        startTime,
        endTime,
        purpose,
        status: 'pending', // Default to pending for admin approval
      })
      .returning();

    return { success: true, data: newBooking };
  } catch (error) {
    console.error('[createBooking] Database error:', error);
    return {
      success: false,
      error: {
        type: 'DATABASE',
        message: 'Failed to create booking. Please try again.',
      },
    };
  }
}

// ============================================================================
// Helper: Get Conflicting Bookings (for UI display)
// ============================================================================
export async function getConflictingBookings(
  roomId: string,
  startTime: Date,
  endTime: Date
) {
  return await db
    .select({
      id: bookings.id,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      purpose: bookings.purpose,
      status: bookings.status,
      userName: users.name,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.roomId, roomId),
        eq(bookings.status, 'confirmed'),
        lt(bookings.startTime, endTime),
        gt(bookings.endTime, startTime)
      )
    )
    .leftJoin(users, eq(bookings.userId, users.id));
}
