import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Users Table
// ============================================================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password'),
  role: text('role', { enum: ['admin', 'employee'] }).notNull().default('employee'),
  image: text('image'),
});

// ============================================================================
// Rooms Table
// ============================================================================
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  location: text('location'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
});

// ============================================================================
// Bookings Table
// ============================================================================
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roomId: uuid('room_id')
    .notNull()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  purpose: text('purpose'),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] })
    .notNull()
    .default('pending'),
});

// ============================================================================
// Relations
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
}));

// ============================================================================
// Type Inferences
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
