import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { EnumUserRole, PgEnumUserRole } from "./types.ts";

/**
 * Table: users
 * 
 * This table stores core user account information including authentication details, profile data, and status.
 * It serves as the primary source of user identity and access control within the application.
 * 
 * Fields:
 * - id: Unique identifier for the user account
 * - email: User's email address (unique across all accounts)
 * - emailVerified: Whether the user's email has been verified
 * - name: User's full name or display name
 * - role: User's role/access level (user, admin, etc.)
 * - image: URL to user's profile image (optional)
 * - createdAt: When the user account was created
 * - updatedAt: When the user account was last updated
 * - banned: Whether the user account is currently banned
 * - banReason: Reason for account ban (optional)
 * - banExpires: When the ban expires (optional)
 * 
 * Design Notes:
 * - The email field is unique and serves as a primary identifier for login
 * - Email verification status is tracked separately to support email confirmation flows
 * - User roles are defined in the EnumUserRole enumeration
 * - Ban information is stored directly in the user record for quick access control checks
 * - The updatedAt field is maintained for cache invalidation and audit purposes
 */
export const users = pgTable('users', {
    id: uuid().primaryKey().notNull().defaultRandom(),
    email: varchar({ length: 50 }).notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    name: varchar('name', { length: 50 }).notNull(),
    role: PgEnumUserRole('role').notNull().default(EnumUserRole.USER),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    banned: boolean().notNull().default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
});

export type User = InferSelectModel<typeof users>;
export type SchemaUserSelect = InferSelectModel<typeof users>;
export type SchemaUserInsert = InferInsertModel<typeof users>;
