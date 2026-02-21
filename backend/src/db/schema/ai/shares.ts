import { pgTable, varchar, timestamp, uuid, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';
import { aiSessions } from './sessions.ts';

/**
 * Table: ai_shares
 * 
 * This table stores information about shared AI chat sessions.
 * It enables read-only access to chat sessions for users who have the share link.
 * 
 * Fields:
 * - id: Unique identifier for the share record
 * - sessionId: ID of the chat session being shared
 * - shareToken: Unique token used to access the shared session (part of the share URL)
 * - createdBy: ID of the user who created the share
 * - extra: JSONB field for storing additional structured data without requiring schema changes with default empty object
 * - expiresAt: Optional expiration date for the share link
 * - createdAt: When the share was created
 * - isActive: Whether the share link is active or disabled
 */
export const aiShares = pgTable('ai_shares', {
    id: uuid().primaryKey().notNull().defaultRandom(),

    // Reference to the chat session being shared
    sessionId: uuid('session_id')
        .notNull()
        .references(() => aiSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    // Unique token for accessing the shared session
    shareToken: varchar('share_token', { length: 255 }).notNull().unique(),

    // User who created the share
    createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    // Flexible data storage
    extra: jsonb("extra")
        .$type<Record<string, unknown>>()
        .default({}),

    // Optional expiration for the share link
    expiresAt: timestamp('expires_at'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // Share status
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('ai_shares_session_id_idx').on(table.sessionId),
]);

export type SchemaAiShareSelect = InferSelectModel<typeof aiShares>;
export type SchemaAiShareInsert = InferInsertModel<typeof aiShares>;
