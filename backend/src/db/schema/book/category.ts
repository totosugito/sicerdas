import { pgTable, varchar, timestamp, text, jsonb, serial, integer } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { EnumContentStatus, PgEnumContentStatus } from "../enum/enum-app.ts";
import { appVersion } from "../app/app-version.ts";

/**
 * Book Category
 * 
 * The `bookCategory` table stores information about different categories of books.
 * Each category has a unique code and name, along with an optional description and extra metadata.
 * It also includes a status field to manage the publication state of the category,
 * and timestamps for tracking creation and update times.
 * 
 * Fields:
 * - id: A unique serial identifier for each category.
 * - versionId: A reference to the version of the application the category belongs to.
 * - code: A unique string identifier for the category (max 64 characters).
 * - name: The name of the category (max 128 characters).
 * - desc: An optional text description of the category.
 * - extra: A JSONB field for storing additional metadata.
 * - status: The publication status of the category (e.g., published, draft).
 * - createdAt: Timestamp of when the category was created.
 * - updatedAt: Timestamp of when the category was last updated.
 *
 */
export const bookCategory = pgTable('book_category', {
    id: serial('id').primaryKey().notNull(),
    versionId: integer('version_id')
        .references(() => appVersion.id, { onDelete: 'set null' })
        .notNull(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    name: varchar('name', { length: 128 }).notNull(),
    desc: text('desc')
        .default(''),
    extra: jsonb("extra")
        .$type<Record<string, unknown>>()
        .default({}),
    status: PgEnumContentStatus('status').notNull().default(EnumContentStatus.PUBLISHED),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type SchemaBookCategoryInsert = InferInsertModel<typeof bookCategory>;
export type SchemaBookCategorySelect = InferSelectModel<typeof bookCategory>;
