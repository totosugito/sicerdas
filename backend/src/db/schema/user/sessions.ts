import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from "./users.ts";

/**
 * Table: sessions
 * 
 * This table tracks active user sessions with authentication tokens and metadata.
 * It enables session-based authentication and provides security information about user sessions.
 * 
 * Fields:
 * - id: Unique identifier for the session record
 * - expiresAt: When the session token expires
 * - token: Unique session token used for authentication
 * - createdAt: When the session was created
 * - updatedAt: When the session was last updated
 * - ipAddress: IP address of the client when session was created
 * - userAgent: Browser/user agent information of the client
 * - userId: ID of the user who owns this session
 * - impersonatedBy: ID of admin user who is impersonating (optional)
 * 
 * Design Notes:
 * - Sessions are tied to specific users via the userId foreign key with cascade delete
 * - The token field is unique to prevent duplicate sessions
 * - IP address and user agent are stored for security auditing
 * - Impersonation tracking allows admins to act on behalf of users while maintaining accountability
 * - Expire times enable automatic session cleanup and security
 */
export const sessions = pgTable('users_sessions', {
    id: uuid().primaryKey().notNull().defaultRandom(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    impersonatedBy: uuid('impersonated_by'),
});

export type SchemaSessionSelect = InferSelectModel<typeof sessions>;
export type SchemaSessionInsert = InferInsertModel<typeof sessions>;
