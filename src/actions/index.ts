import { db } from '@/db';
import { bookings, rooms, users, type Room } from '@/db/schema';
import { eq, and, lt, gt, desc, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================
export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(100),
  location: z.string().max(200).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const updateRoomSchema = createRoomSchema.partial();

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});

// ============================================================================
// Room Server Actions
// ============================================================================
export async function getRooms() {
  try {
    const allRooms = await db.select().from(rooms).orderBy(rooms.name);
    return { success: true, data: allRooms };
  } catch (error) {
    console.error('[getRooms] Error:', error);
    return { success: false, error: 'Failed to fetch rooms' };
  }
}

export async function getRoomById(roomId: string) {
  try {
    const roomList = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (roomList.length === 0) {
      return { success: false, error: 'Room not found' };
    }

    return { success: true, data: roomList[0] };
  } catch (error) {
    console.error('[getRoomById] Error:', error);
    return { success: false, error: 'Failed to fetch room' };
  }
}

export async function createRoom(input: z.infer<typeof createRoomSchema>) {
  try {
    const validation = createRoomSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid input',
      };
    }

    const [newRoom] = await db.insert(rooms).values(validation.data).returning();
    return { success: true, data: newRoom };
  } catch (error) {
    console.error('[createRoom] Error:', error);
    return { success: false, error: 'Failed to create room' };
  }
}

export async function updateRoom(
  roomId: string,
  input: z.infer<typeof updateRoomSchema>
) {
  try {
    const validation = updateRoomSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid input',
      };
    }

    const [updatedRoom] = await db
      .update(rooms)
      .set(validation.data)
      .where(eq(rooms.id, roomId))
      .returning();

    if (!updatedRoom) {
      return { success: false, error: 'Room not found' };
    }

    return { success: true, data: updatedRoom };
  } catch (error) {
    console.error('[updateRoom] Error:', error);
    return { success: false, error: 'Failed to update room' };
  }
}

export async function deleteRoom(roomId: string) {
  try {
    // Check for active confirmed bookings
    const activeBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, roomId),
          eq(bookings.status, 'confirmed'),
          gte(bookings.startTime, new Date())
        )
      );

    if (activeBookings.length > 0) {
      return {
        success: false,
        error: 'Cannot delete room with active confirmed bookings',
      };
    }

    await db.delete(rooms).where(eq(rooms.id, roomId));
    return { success: true };
  } catch (error) {
    console.error('[deleteRoom] Error:', error);
    return { success: false, error: 'Failed to delete room' };
  }
}

// ============================================================================
// Booking Server Actions
// ============================================================================
export async function getBookingsByUser(userId: string) {
  try {
    const userBookings = await db
      .select({
        id: bookings.id,
        roomId: bookings.roomId,
        roomName: rooms.name,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        purpose: bookings.purpose,
        status: bookings.status,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.startTime));

    return { success: true, data: userBookings };
  } catch (error) {
    console.error('[getBookingsByUser] Error:', error);
    return { success: false, error: 'Failed to fetch bookings' };
  }
}

export async function getAllBookings() {
  try {
    const allBookings = await db
      .select({
        id: bookings.id,
        roomId: bookings.roomId,
        roomName: rooms.name,
        userId: bookings.userId,
        userName: users.name,
        userEmail: users.email,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        purpose: bookings.purpose,
        status: bookings.status,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.startTime));

    return { success: true, data: allBookings };
  } catch (error) {
    console.error('[getAllBookings] Error:', error);
    return { success: false, error: 'Failed to fetch bookings' };
  }
}

export async function getPendingBookings() {
  try {
    const pendingBookings = await db
      .select({
        id: bookings.id,
        roomId: bookings.roomId,
        roomName: rooms.name,
        userId: bookings.userId,
        userName: users.name,
        userEmail: users.email,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        purpose: bookings.purpose,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.status, 'pending'))
      .orderBy(desc(bookings.startTime));

    return { success: true, data: pendingBookings };
  } catch (error) {
    console.error('[getPendingBookings] Error:', error);
    return { success: false, error: 'Failed to fetch pending bookings' };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'cancelled'
) {
  try {
    const validation = updateBookingStatusSchema.safeParse({
      bookingId,
      status,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid input',
      };
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      return { success: false, error: 'Booking not found' };
    }

    // If confirming, auto-reject overlapping pending bookings
    if (status === 'confirmed') {
      await db
        .update(bookings)
        .set({ status: 'cancelled' })
        .where(
          and(
            eq(bookings.roomId, updatedBooking.roomId),
            eq(bookings.status, 'pending'),
            lt(bookings.startTime, updatedBooking.endTime),
            gt(bookings.endTime, updatedBooking.startTime),
            gt(bookings.id, bookingId) // Don't cancel the booking itself
          )
        );
    }

    return { success: true, data: updatedBooking };
  } catch (error) {
    console.error('[updateBookingStatus] Error:', error);
    return { success: false, error: 'Failed to update booking status' };
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const [cancelledBooking] = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!cancelledBooking) {
      return { success: false, error: 'Booking not found' };
    }

    return { success: true, data: cancelledBooking };
  } catch (error) {
    console.error('[cancelBooking] Error:', error);
    return { success: false, error: 'Failed to cancel booking' };
  }
}

// ============================================================================
// Get Room Availability (for a specific date)
// ============================================================================
export async function getRoomAvailability(roomId: string, date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookingsForDay = await db
      .select({
        id: bookings.id,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, roomId),
          gte(bookings.startTime, startOfDay),
          lte(bookings.startTime, endOfDay),
          eq(bookings.status, 'confirmed')
        )
      );

    return { success: true, data: bookingsForDay };
  } catch (error) {
    console.error('[getRoomAvailability] Error:', error);
    return { success: false, error: 'Failed to fetch room availability' };
  }
}
