import { pgTable, uuid, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { users } from '../auth-schema.ts';
import { userContentReport } from './reports.ts';

/**
 * Table: user_report_replies
 * 
 * This table stores replies/discussions related to user reports.
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
export const userReportReplies = pgTable('user_report_replies', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Reference to the report
    reportId: uuid('report_id')
        .notNull()
        .references(() => userContentReport.id, { onDelete: 'cascade' }),

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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    // Indexes for better query performance
    index('user_report_replies_report_id_index').on(table.reportId),
    index('user_report_replies_author_id_index').on(table.authorId),
]);
export type SchemaUserReportReplyInsert = typeof userReportReplies.$inferInsert;
export type SchemaUserReportReplySelect = typeof userReportReplies.$inferSelect;
