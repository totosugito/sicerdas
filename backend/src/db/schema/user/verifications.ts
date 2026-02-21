import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * Table: verifications
 * 
 * This table stores temporary verification codes for email confirmation, password reset, etc.
 * It enables secure verification flows for user account actions.
 * 
 * Fields:
 * - id: Unique identifier for the verification record
 * - identifier: Unique identifier for the verification (e.g., email address)
 * - value: The user id
 * - expiresAt: When the verification code expires
 * - createdAt: When the verification record was created
 * - updatedAt: When the verification record was last updated
 * 
 * Design Notes:
 * - Used for email verification, password reset, and other account confirmation flows
 * - The identifier field can store email addresses or other unique identifiers
 * - Verification codes are time-limited for security
 * - The value field stores the user id
 * - Automatic cleanup of expired records should be implemented via cron job
 */
export const verifications = pgTable("users_verifications", {
    id: uuid().primaryKey().notNull().defaultRandom(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export type SchemaVerificationSelect = InferSelectModel<typeof verifications>;
export type SchemaVerificationInsert = InferInsertModel<typeof verifications>;
