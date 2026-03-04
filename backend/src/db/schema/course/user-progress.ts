import { boolean, index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';
import { courses } from './courses.ts';
import { courseLectures } from './lectures.ts';

/**
 * Table: course_user_progress
 * 
 * Tracks individual lecture progress for each student. This is the Core engine 
 * of a Course CMS to record exactly where a user left off and what they have finished.
 */
export const courseUserProgress = pgTable('course_user_progress', {
    // Unique identifier for the progress record
    id: uuid('id').primaryKey().defaultRandom(),

    // User tracking progress
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    // Course Context
    courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),

    // The precise lecture being tracked
    lectureId: uuid('lecture_id').references(() => courseLectures.id, { onDelete: 'cascade' }).notNull(),

    // Specific to video lectures - how far the user watched before exiting
    watchTimeSeconds: integer('watch_time_seconds').default(0).notNull(),

    // True when the lecture has been fully completed by the user
    isCompleted: boolean('is_completed').default(false).notNull(),

    // Time the user finished the lecture
    completedAt: timestamp('completed_at', { withTimezone: true }),

    // Last time progress was updated
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('course_user_progress_lookup_idx').on(table.userId, table.courseId, table.lectureId),
    index('course_user_progress_course_lookup_idx').on(table.userId, table.courseId),
]);

export type SchemaCourseUserProgressSelect = InferSelectModel<typeof courseUserProgress>;
export type SchemaCourseUserProgressInsert = InferInsertModel<typeof courseUserProgress>;
