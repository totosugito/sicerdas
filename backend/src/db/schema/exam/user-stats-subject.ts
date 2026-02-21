import { pgTable, uuid, timestamp, integer, decimal, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';
import { examSubjects } from './subjects.ts';

/**
 * Table: exam_user_stats_subject
 * 
 * Stores specific performance metrics segmented by subject (e.g., TIU vs TWK).
 * Answers questions like "I am strong in Math, but weak in Physics."
 */
export const examUserStatsSubject = pgTable('exam_user_stats_subject', {
    // Unique identifier for the subject record
    id: uuid('id').primaryKey().defaultRandom(),

    // Subject user relationship
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    subjectId: uuid('subject_id').references(() => examSubjects.id, { onDelete: 'cascade' }).notNull(),

    // Analytical counters for this specific subject
    totalQuestionsAnswered: integer('total_questions_answered').default(0).notNull(),
    totalCorrect: integer('total_correct').default(0).notNull(),
    totalWrong: integer('total_wrong').default(0).notNull(),

    // Hit Rate percentage (0-100) specific to this subject. Used for Spider Charts.
    accuracyRate: decimal('accuracy_rate', { precision: 5, scale: 2 }).default('0').notNull(),

    // Timestamp representing the last time this specific aggregate was incremented
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('exam_user_stats_subject_lookup_idx').on(table.userId, table.subjectId),
]);

export type SchemaExamUserStatSubjectSelect = InferSelectModel<typeof examUserStatsSubject>;
export type SchemaExamUserStatSubjectInsert = InferInsertModel<typeof examUserStatsSubject>;
