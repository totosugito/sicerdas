import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { PgEnumContentType, EnumContentType, PgEnumEventStatus, EnumEventStatus } from '../enum/enum-app.ts';
import { users } from '../user/users.ts';



/**
 * Table: app_event_history
 * 
 * This table tracks user interactions with content items.
 * It also supports polymorphic relationships and includes session tracking.
 * 
 * Fields:
 * - id: Unique identifier for the event
 * - userId: ID of the user who performed the event
 * - sessionId: Anonymous session identifier
 * - ipAddress: IP address of the user
 * - userAgent: Browser information
 * - createdAt: When the event occurred
 */
export const appEventHistory = pgTable('app_event_history', {
  id: uuid('id').primaryKey().defaultRandom(),

  // User who performed the event (optional for guests)
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' }),

  // Event details
  action: PgEnumEventStatus('action').notNull().default(EnumEventStatus.VIEW),
  contentType: PgEnumContentType('content_type').notNull().default(EnumContentType.BOOK),
  referenceId: uuid('reference_id').notNull(),

  // Session information for anonymous tracking
  sessionId: uuid('session_id'), // Generated in frontend and saved in cookie
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  // Indexes for better query performance
  index('app_event_history_user_id_index').on(table.userId),
  index('app_event_history_session_id_index').on(table.sessionId),
  index('app_event_history_reference_id_index').on(table.referenceId),
  index('app_event_history_action_index').on(table.action),
  // Optimized composite indexes for recent history lookup
  index('app_event_history_user_lookup_idx').on(table.userId, table.referenceId, table.action, table.createdAt),
  index('app_event_history_session_lookup_idx').on(table.sessionId, table.referenceId, table.action, table.createdAt),
  index('app_event_history_ip_lookup_idx').on(table.ipAddress, table.referenceId, table.action, table.createdAt),
]);
export type SchemaAppEventHistoryInsert = typeof appEventHistory.$inferInsert;
export type SchemaAppEventHistorySelect = typeof appEventHistory.$inferSelect;