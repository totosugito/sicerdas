import { pgTable, timestamp, jsonb, uuid, numeric, integer, boolean, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { users } from '../user/users.ts';
import { books } from "./books.ts";

/**
 * User Book Interactions
 * 
 * The `userBookInteractions` table tracks individual user interactions with books.
 * Unlike bookEventStats which tracks global statistics, this table stores per-user
 * interactions allowing us to know if a specific user has liked, rated, bookmarked,
 * viewed (multiple times), or downloaded a book. This enables personalized experiences.
 * 
 * Fields:
 * - id: A unique UUID identifier for each interaction record.
 * - userId: References the user who performed the interaction.
 * - bookId: References the book that was interacted with.
 * - liked: Boolean indicating if the user liked the book.
 * - disliked: Boolean indicating if the user disliked the book.
 * - rating: User's rating of the book (0.00 to 5.00).
 * - bookmarked: Boolean indicating if the user bookmarked the book.
 * - viewCount: Number of times user viewed this book.
 * - downloadCount: Number of times user downloaded this book.
 * - extra: Flexible data storage for additional session details (optional)
 * - createdAt: Timestamp of when the interaction record was created.
 * - updatedAt: Timestamp of when the interaction record was last updated.
 */
export const bookInteractions = pgTable('book_interactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    bookId: uuid('book_id')
        .references(() => books.id, { onDelete: 'cascade' })
        .notNull(),

    // Individual user interactions
    liked: boolean('liked').default(false),
    disliked: boolean('disliked').default(false),
    rating: numeric('rating', { precision: 3, scale: 2 }).default('0.00'),
    bookmarked: boolean('bookmarked').default(false),
    viewCount: integer('view_count').default(0),
    downloadCount: integer('download_count').default(0),

    // Flexible data storage
    extra: jsonb("extra")
        .$type<Record<string, unknown>>()
        .default({}),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex('book_interactions_user_book_unique_index').on(table.userId, table.bookId),
    index('book_interactions_book_id_index').on(table.bookId),
]);

export type SchemaBookInteractionInsert = InferInsertModel<typeof bookInteractions>;
export type SchemaBookInteractionSelect = InferSelectModel<typeof bookInteractions>;
