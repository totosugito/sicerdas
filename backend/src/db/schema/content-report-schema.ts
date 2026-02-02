
import { pgTable, uuid, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { PgEnumContentType, EnumContentType } from './enum-app.ts';
import { PgEnumReportStatus, PgEnumReportReason, EnumReportReason, EnumReportStatus } from './enum-general.ts';
import { users } from './auth-schema.ts';

/**
 * Table: user_reports
 * 
 * This table stores user-generated reports for various content types (books, tests, courses, and other).
 * It supports a polymorphic relationship through dataType and referenceId fields.
 * 
 * Fields:
 * - id: Unique identifier for the report
 * - reporterId: ID of the user who submitted the report
 * - contentType: Type of content being reported (book, test, course, or other)
 * - referenceId: ID of the specific content item being reported (optional for "other" content type)
 * - name: Name of the reporter
 * - email: Email of the reporter
 * - title: Title of the content being reported
 * - reason: Reason for the report (from PgEnumReportReason)
 * - description: Additional details about the report
 * - status: Current status of the report (default: pending)
 * - createdAt: When the report was created
 * - updatedAt: When the report was last updated
 * - extra: Flexible data storage
 * - resolvedAt: When the report was resolved
 * - resolvedBy: ID of the user who resolved the report
 * - resolutionNotes: Summary of the resolution or key points from the discussion
 * 
 * Note: Detailed discussion between user and admin is stored in user_report_replies table.
 */
export const userContentReport = pgTable('user_content_report', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Reporter information
    reporterId: uuid('reporter_id')
        .references(() => users.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),
    email: text('email').notNull(),
    title: text('title').notNull(),

    // Polymorphic relationship to support content type [books, tests, courses, and other]
    contentType: PgEnumContentType('content_type').notNull().default(EnumContentType.BOOK),
    referenceId: uuid('reference_id').notNull(), // Made optional to support "other" content type

    // Report details
    reason: PgEnumReportReason('reason').notNull().default(EnumReportReason.OTHER), // Reason for the report
    description: text('description'), // Additional details

    // Report status
    status: PgEnumReportStatus('status').notNull().default(EnumReportStatus.PENDING),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    // Flexible data storage
    extra: jsonb('extra')
        .$type<Record<string, unknown>>()
        .default({}), // JSONB for storing additional structured data with default empty object

    // Resolution information
    resolvedAt: timestamp('resolved_at'),
    resolvedBy: uuid('resolved_by')
        .references(() => users.id, { onDelete: 'set null' }),
    resolutionNotes: text('resolution_notes'),
}, (table) => [
    // Indexes for better query performance
    index('user_content_report_content_type_index').on(table.contentType),
    index('user_content_report_reference_id_index').on(table.referenceId),
    index('user_content_report_status_index').on(table.status),
    index('user_content_report_reporter_id_index').on(table.reporterId),
]);

export type SchemaUserReportInsert = typeof userContentReport.$inferInsert;
export type SchemaUserReportSelect = typeof userContentReport.$inferSelect;

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