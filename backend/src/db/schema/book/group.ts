import { pgTable, varchar, timestamp, text, jsonb, serial, integer } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { EnumContentStatus, PgEnumContentStatus } from "../enum/enum-app.ts";
import { appVersion } from "../app/app-version.ts";
import { bookCategory } from "./category.ts";

/**
 * Book Group
 * 
 * The `bookGroup` table organizes books into logical groups within a specific category.
 * Each group is associated with a version and a category, and contains metadata such as name and description.
 * It supports tracking the publication status and maintains timestamps for creation and updates.
 * 
 * Fields:
 * - id: A unique serial identifier for each book group.
 * - versionId: References the application version this group belongs to.
 * - categoryId: References the category that this group belongs under.
 * - name: The name of the book group (max 128 characters).
 * - shortName: The short name of the book group (max 64 characters).
 * - desc: An optional textual description of the group.
 * - extra: A JSONB field for additional unstructured data.
 * - status: Publication status of the group (e.g., published, draft).
 * - createdAt: Timestamp indicating when the group was created.
 * - updatedAt: Timestamp indicating when the group was last modified.
 *
 */
export const bookGroup = pgTable('book_group', {
    id: serial('id').primaryKey().notNull(),
    versionId: integer('version_id')
        .references(() => appVersion.id, { onDelete: 'set null' })
        .notNull(),
    categoryId: integer('category_id')
        .references(() => bookCategory.id, { onDelete: 'set null' })
        .notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    shortName: varchar('short_name', { length: 128 }).notNull(),
    desc: text('desc')
        .default(''),
    extra: jsonb("extra")
        .$type<Record<string, unknown>>()
        .default({}),
    status: PgEnumContentStatus('status').notNull().default(EnumContentStatus.PUBLISHED),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type SchemaBookGroupInsert = InferInsertModel<typeof bookGroup>;
export type SchemaBookGroupSelect = InferSelectModel<typeof bookGroup>;
