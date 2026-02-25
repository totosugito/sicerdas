import { pgTable, timestamp, jsonb, serial, integer, index } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { bookGroup } from "./group.ts";

/**
 * Book Group Statistics
 * 
 * The `bookGroupStats` table maintains statistical information about book groups.
 * It tracks the total number of books within each group, providing insights into
 * the size and activity of different sections in the library.
 * 
 * Fields:
 * - id: A unique serial identifier for each statistics record.
 * - bookGroupId: References the book group that these statistics belong to.
 * - bookTotal: The total count of books in the associated book group.
 * - extra: Additional information or metadata related to the book group statistics.
 * - createdAt: Timestamp of when the statistics record was created.
 * - updatedAt: Timestamp of when the statistics record was last updated.
 */
export const bookGroupStats = pgTable('book_group_stats', {
    id: serial('id').primaryKey().notNull(),
    bookGroupId: integer('book_group_id')
        .references(() => bookGroup.id, { onDelete: 'set null' })
        .notNull(),
    bookTotal: integer('book_total').default(0),

    // Flexible data storage
    extra: jsonb("extra")
        .$type<Record<string, unknown>>()
        .default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('book_group_stats_book_group_id_index').on(table.bookGroupId),
]);

export type SchemaBookGroupStatInsert = InferInsertModel<typeof bookGroupStats>;
export type SchemaBookGroupStatSelect = InferSelectModel<typeof bookGroupStats>;
