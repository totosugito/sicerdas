import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';
import { EnumEducationLevel, PgEnumEducationLevel } from '../enum/enum-app.ts';
import { appTier } from '../app/app-tier.ts';
import { users } from "./users.ts";

/**
 * Table: users_profiles
 * 
 * This table stores additional user information such as school, grade, phone number, and other profile details.
 * This table has a one-to-one relationship with the users table.
 * 
 * Fields:
 * - id: Unique identifier matching the user ID (one-to-one relationship)
 * - school: Name of the user's school (optional)
 * - grade: Educational grade level of the user (optional)
 * - phone: User's phone number (optional)
 * - address: User's address (optional)
 * - bio: Short biography or description of the user (optional)
 * - dateOfBirth: User's date of birth (optional)
 * - tierId: Link to the user's current pricing tier
 * - extra: JSONB field for storing additional structured data without requiring schema changes with default empty object
 * - createdAt: When the profile record was created
 * - updatedAt: When the profile record was last updated
 * 
 * Design Notes:
 * - This table maintains a one-to-one relationship with the users table
 * - All fields are optional to accommodate different user types and data availability
 * - The extra field allows for flexible storage of profile-specific metadata
 *   without requiring database migrations
 * - The id field references the user's ID directly, ensuring data consistency
 */
export const usersProfile = pgTable('users_profiles', {
    // Primary key that matches the user ID for one-to-one relationship
    id: uuid('id').primaryKey().notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    // Educational information
    school: varchar('school', { length: 255 }),
    educationLevel: PgEnumEducationLevel('education_level').default(EnumEducationLevel.UNKNOWN),
    grade: varchar('grade', { length: 50 }),

    // Contact information
    phone: varchar('phone', { length: 20 }),
    address: text('address'),

    // Personal information
    bio: text('bio'),
    dateOfBirth: timestamp('date_of_birth'),

    // Pricing / Tier Link
    tierId: varchar('tier_id', { length: 50 })
        .default("free")
        .references(() => appTier.slug, { onDelete: 'set null', onUpdate: 'cascade' }),

    // Flexible data storage
    extra: jsonb('extra')
        .$type<Record<string, unknown>>()
        .default({}),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SchemaUsersProfileSelect = InferSelectModel<typeof usersProfile>;
export type SchemaUsersProfileInsert = InferInsertModel<typeof usersProfile>;
