import { pgTable, timestamp, uuid, integer, decimal } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';

/**
 * Table: course_user_stats_global
 * 
 * Provides a high-level overview for a user's course dashboard. Stores aggregated 
 * metrics across all courses enrolled or completed by the user. Updated incrementally.
 */
export const courseUserStatsGlobal = pgTable('course_user_stats_global', {
    // The user this global statistic belongs to
    userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),

    // Total number of courses the user is currently enrolled in
    totalCoursesEnrolled: integer('total_courses_enrolled').default(0).notNull(),

    // Total number of courses the user has fully completed
    totalCoursesCompleted: integer('total_courses_completed').default(0).notNull(),

    // Total number of individual lectures the user has finished
    totalLecturesCompleted: integer('total_lectures_completed').default(0).notNull(),

    // Total time the user has spent watching video lectures (in minutes)
    totalWatchTimeMinutes: decimal('total_watch_time_minutes', { precision: 10, scale: 2 }).default('0').notNull(),

    // Timestamp when the user was last active in a course
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),

    // Timestamp when this statistics row was last updated incrementally
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SchemaCourseUserStatGlobalSelect = InferSelectModel<typeof courseUserStatsGlobal>;
export type SchemaCourseUserStatGlobalInsert = InferInsertModel<typeof courseUserStatsGlobal>;
