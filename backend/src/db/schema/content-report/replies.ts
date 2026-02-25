import { pgTable, uuid, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../user/users.ts';
import { contentReport } from './reports.ts';

/**
 * Table: content_report_replies
 * 
 * This table stores replies/discussions related to content reports.
 * It enables back-and-forth communication between users and admins.
 * 
 * Fields:
 * - id: Unique identifier for the reply
 * - reportId: ID of the report this reply belongs to
 * - authorId: ID of the user who wrote the reply (can be user or admin)
 * - content: The text content of the reply
 * - extra: Flexible data storage
 * - createdAt: When the reply was created
 * - updatedAt: When the reply was last updated
 */
export const contentReportReplies = pgTable('content_report_replies', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Reference to the report
    reportId: uuid('report_id')
        .notNull()
        .references(() => contentReport.id, { onDelete: 'cascade' }),

    // Author of the reply (can be user or admin)
    authorId: uuid('author_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    // Reply content
    content: text('content').notNull(),

    // Flexible data storage
    extra: jsonb('extra')
        .$type<Record<string, unknown>>()
        .default({}), // JSONB for storing additional structured data with default empty object

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    // Indexes for better query performance
    index('content_report_replies_report_id_index').on(table.reportId),
    index('content_report_replies_author_id_index').on(table.authorId),
]);
export type SchemaContentReportReplyInsert = typeof contentReportReplies.$inferInsert;
export type SchemaContentReportReplySelect = typeof contentReportReplies.$inferSelect;
