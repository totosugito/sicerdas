import { pgTable, uuid, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { PgEnumContentType, EnumContentType } from '../enum/enum-app.ts';
import { PgEnumReportStatus, PgEnumReportReason, EnumReportReason, EnumReportStatus } from '../enum/enum-general.ts';
import { users } from '../user/users.ts';

/**
 * Table: content_report
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
export const contentReport = pgTable('content_report', {
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
    index('content_report_content_type_index').on(table.contentType),
    index('content_report_reference_id_index').on(table.referenceId),
    index('content_report_status_index').on(table.status),
    index('content_report_reporter_id_index').on(table.reporterId),
]);

export type SchemaContentReportInsert = typeof contentReport.$inferInsert;
export type SchemaContentReportSelect = typeof contentReport.$inferSelect;
