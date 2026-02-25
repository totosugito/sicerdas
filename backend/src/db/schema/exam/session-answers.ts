import { pgTable, uuid, timestamp, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { examSessions } from './sessions.ts';
import { examQuestions } from './questions.ts';
import { examQuestionOptions } from './question-options.ts';

/**
 * Table: exam_session_answers
 * 
 * Represents the localized "Answer Sheet" for a user's exam attempt.
 * Preserves randomized ordering and auto-saves selected answers in real-time.
 */
export const examSessionAnswers = pgTable('exam_session_answers', {
    // Unique identifier for the answer row
    id: uuid('id').primaryKey().defaultRandom(),

    // The overarching exam session
    sessionId: uuid('session_id').references(() => examSessions.id, { onDelete: 'cascade' }).notNull(),

    // The specific question being answered
    questionId: uuid('question_id').references(() => examQuestions.id, { onDelete: 'restrict' }).notNull(),

    // The localized, randomized sequence order this question was presented to this specific user
    questionOrder: integer('question_order').notNull(),

    // The multiple-choice option selected by the user (autosave)
    selectedOptionId: uuid('selected_option_id').references(() => examQuestionOptions.id, { onDelete: 'set null' }),

    // Filled if the question type is Essay. Uses BlockNote JSON structure.
    textAnswer: jsonb('text_answer').$type<Record<string, unknown>[]>(),

    // System's final judgment on whether the user answered correctly. Populated upon submission.
    isCorrect: boolean('is_correct'),

    // UI flag indicating the user is unsure about their answer (e.g., 'Ragu-ragu' feature)
    isDoubtful: boolean('is_doubtful').default(false).notNull(),

    // Timestamp when this answer was initially populated
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this answer was last auto-saved
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('exam_session_answers_session_id_idx').on(table.sessionId),
    index('exam_session_answers_question_id_idx').on(table.questionId),
]);

export type SchemaExamSessionAnswerSelect = InferSelectModel<typeof examSessionAnswers>;
export type SchemaExamSessionAnswerInsert = InferInsertModel<typeof examSessionAnswers>;
