import { pgTable, uuid, timestamp, integer, decimal } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';

/**
 * Table: exam_user_stats_global
 * 
 * Provides a high-level overview for a user's dashboard. Stores aggregated 
 * metrics across all exams and subjects taken by the user. Updated incrementally.
 */
export const examUserStatsGlobal = pgTable('exam_user_stats_global', {
    // The user this global statistic belongs to
    userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),

    // Total number of exams/tryouts the user has completed
    totalExamsTaken: integer('total_exams_taken').default(0).notNull(),

    // Total number of individual questions answered across all time
    totalQuestionsAnswered: integer('total_questions_answered').default(0).notNull(),

    // Total number of options chosen correctly
    totalCorrectAnswers: integer('total_correct_answers').default(0).notNull(),

    // Total number of options chosen incorrectly
    totalWrongAnswers: integer('total_wrong_answers').default(0).notNull(),

    // Global historical average score across all tryouts
    averageScore: decimal('average_score', { precision: 10, scale: 2 }).default('0').notNull(),

    // Timestamp when the user last took an exam
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),

    // Timestamp when this statistics row was last updated incrementally
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SchemaExamUserStatGlobalSelect = InferSelectModel<typeof examUserStatsGlobal>;
export type SchemaExamUserStatGlobalInsert = InferInsertModel<typeof examUserStatsGlobal>;
