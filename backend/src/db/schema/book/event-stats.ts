import { pgTable, timestamp, jsonb, uuid, numeric, integer } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { books } from "./books.ts";

/**
 * Book Event Stats
 * 
 * The `bookEventStats` table tracks various user interaction events for each book.
 * It maintains counters for views, downloads, likes, dislikes, shares, and bookmarks,
 * as well as an average rating for the book. This data is crucial for understanding
 * user engagement and content popularity.
 * 
 * Fields:
 * - id: A unique UUID identifier for each event stats record.
 * - bookId: A reference to the book that these stats belong to (UUID).
 * - viewCount: Number of times the book has been viewed.
 * - downloadCount: Number of times the book has been downloaded.
 * - likeCount: Number of likes received for the book.
 * - dislikeCount: Number of dislikes received for the book.
 * - shareCount: Number of times the book has been shared.
 * - bookmarkCount: Number of times the book has been bookmarked.
 * - rating: Average rating of the book, stored as a decimal value (0.00 to 5.00).
 * - legacyStats: Archived stats (views/downloads) from deleted guest events.
 * - extra: Additional information about the book, such as its popularity, quality, etc.
 * - createdAt: Timestamp of when the stats record was created.
 * - updatedAt: Timestamp of when the stats record was last updated.
 */
export const bookEventStats = pgTable('book_event_stats', {
    id: uuid('id').primaryKey().defaultRandom(),
    bookId: uuid('book_id')
        .references(() => books.id, { onDelete: 'cascade' })
        .notNull()
        .unique(), // Changed to UUID to match books.id

    // Event counters for each type
    viewCount: integer('view_count').notNull().default(0),
    downloadCount: integer('download_count').notNull().default(0),
    likeCount: integer('like_count').notNull().default(0),
    dislikeCount: integer('dislike_count').notNull().default(0),
    shareCount: integer('share_count').notNull().default(0),
    bookmarkCount: integer('bookmark_count').notNull().default(0),
    ratingCount: integer('rating_count').notNull().default(0),
    ratingSum: numeric('rating_sum', { precision: 10, scale: 2 }).notNull().default('0.00'),
    rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0.00'),

    // Legacy/Archived stats (from deleted userEventHistory)
    legacyStats: jsonb('legacy_stats')
        .$type<{ viewCount: number; downloadCount: number }>()
        .default({ viewCount: 0, downloadCount: 0 }),

    // Flexible data storage
    extra: jsonb("extra")
        .$type<Record<string, unknown>>()
        .default({}),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SchemaBookEventStatInsert = InferInsertModel<typeof bookEventStats>;
export type SchemaBookEventStatSelect = InferSelectModel<typeof bookEventStats>;
