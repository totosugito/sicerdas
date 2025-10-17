import type { InferSelectModel } from 'drizzle-orm';
import { boolean, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './auth-schema.ts';
import { 
  PgEnumNotificationPriority, 
  PgEnumNotificationStatus, 
  PgEnumNotificationType 
} from './enum-app.ts';

/**
 * Table: notifications
 * 
 * This table stores user notifications with details about notification types, priorities, and statuses.
 * Notifications can be system-generated or user-generated messages that inform users about events,
 * updates, or actions they might need to take.
 * 
 * Fields:
 * - id: Unique identifier for the notification
 * - userId: Reference to the user who receives the notification
 * - title: Short descriptive title for the notification
 * - message: Detailed message content of the notification
 * - type: Category of notification (system, user, content, etc.)
 * - status: Current status of the notification (unread, read, archived, etc.)
 * - priority: Importance level of the notification (low, normal, high, critical, error)
 * - readAt: Timestamp when the notification was marked as read
 * - sentAt: Timestamp when the notification was sent
 * - createdAt: When the notification was created
 * - updatedAt: When the notification was last updated
 * - expiresAt: Optional timestamp after which the notification is no longer relevant
 * - isArchived: Flag indicating if the notification has been archived
 * - extra: JSONB field for storing additional structured data related to the notification
 * 
 * Design Notes:
 * - The userId field creates a direct relationship with the users table, ensuring notifications
 *   are properly associated with user accounts
 * - The type field uses EnumNotificationType to categorize notifications
 * - The status field uses EnumNotificationStatus to track notification state
 * - The priority field uses EnumNotificationPriority to indicate importance level
 * - The extra field is implemented as JSONB to allow flexible storage of additional data
 *   without requiring schema changes for each new notification type
 * - Cascade delete/update ensures notifications are cleaned up when users are removed
 * - Default values for status ('unread') and priority ('normal') ensure consistent behavior
 * 
 * Purpose of sentAt vs createdAt:
 * - createdAt: When the notification record was created in the database (when the system
 *   decided to send a notification)
 * - sentAt: When the notification was actually sent to the user (e.g., via email, push notification,
 *   or made available in the notification center)
 * 
 * These timestamps can be different because:
 * 1. Notifications might be queued for delivery
 * 2. Email notifications might be sent in batches
 * 3. Some notifications might be delayed based on user preferences
 * 4. System notifications might be sent immediately while others require processing
 * 
 * Example Usage for Report Reply Notifications:
 * When an admin replies to a user report (userContentReport), a notification should be created:
 * - userId: The ID of the user who created the original report
 * - title: "Admin Response to Your Report"
 * - message: "An admin has responded to your report: [First few words of reply]"
 * - type: "report" (from EnumNotificationType)
 * - priority: "normal" or "high" depending on the report type
 * - extra: {
 *     reportId: "[ID of the report]",
 *     replyId: "[ID of the reply]",
 *     reportReason: "[Original report reason]",
 *     adminName: "[Name of admin who replied]"
 *   }
 */
export const notifications = pgTable('notifications', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  
  // User who receives the notification
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  // Notification details
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  
  // Classification and status
  type: PgEnumNotificationType('type').notNull(),
  status: PgEnumNotificationStatus('status').notNull().default('unread'),
  priority: PgEnumNotificationPriority('priority').notNull().default('normal'),
  
  // Timestamps
  readAt: timestamp('read_at'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  
  // Flags
  isArchived: boolean('is_archived').notNull().default(false),
  
  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),
});

export type Notification = InferSelectModel<typeof notifications>;