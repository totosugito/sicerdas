import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { index, integer, numeric, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { courses } from './courses.ts';

/**
 * Table: course_stats
 * 
 * This table stores statistical information about courses, including counts of various
 * related entities like chapters, lectures, students, etc. This data is typically updated
 * asynchronously to avoid performance impacts on primary operations.
 * 
 * Fields:
 * - courseId: Reference to the course (primary key)
 * - totalChapters: Total number of chapters in the course
 * - totalLectures: Total number of lectures in the course
 * - totalStudents: Total number of students enrolled in the course
 * - totalRatings: Total number of ratings received for the course
 * - averageRating: Average rating score for the course
 * - lastUpdated: When the statistics were last updated
 * - extra: JSONB field for storing additional structured data without requiring schema changes
 * 
 * Design Notes:
 * - This table should be updated asynchronously via background jobs or triggers
 * - Direct manual updates should be avoided in favor of automated processes
 * - The lastUpdated field helps with cache invalidation
 */
export const courseStats = pgTable('course_stats', {
    courseId: uuid('course_id')
        .primaryKey()
        .references(() => courses.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    totalChapters: integer('total_chapters').notNull().default(0),
    totalLectures: integer('total_lectures').notNull().default(0),
    totalStudents: integer('total_students').notNull().default(0),
    totalRatings: integer('total_ratings').notNull().default(0),
    averageRating: numeric('average_rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
    extra: jsonb('extra')
        .$type<Record<string, unknown>>()
        .default({}),
}, (table) => [
    index('course_stats_last_updated_idx').on(table.lastUpdated),
]);

export type SchemaCourseStatSelect = InferSelectModel<typeof courseStats>;
export type SchemaCourseStatInsert = InferInsertModel<typeof courseStats>;
