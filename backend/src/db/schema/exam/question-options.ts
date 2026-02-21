import { pgTable, uuid, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { examQuestions } from './questions.ts';

/**
 * Table: exam_question_options
 * 
 * Stores the multiple-choice options (A, B, C, D, E) linked to a specific question.
 * The truth value of whether an option is the correct answer is kept here.
 */
export const examQuestionOptions = pgTable('exam_question_options', {
    // Unique identifier for the option
    id: uuid('id').primaryKey().defaultRandom(),

    // The question this option belongs to
    questionId: uuid('question_id').references(() => examQuestions.id, { onDelete: 'cascade' }).notNull(),

    // Rich text content of the option stored in BlockNote JSON format
    content: jsonb('content').$type<Record<string, unknown>[]>().notNull(),

    // Flag indicating if this is the correct answer
    isCorrect: boolean('is_correct').default(false).notNull(),

    // Pre-defined ordering sequence (e.g., 1 for A, 2 for B)
    order: integer('order').notNull().default(0),
}, (table) => [
    index('exam_question_options_question_id_idx').on(table.questionId),
]);

export type SchemaExamQuestionOptionSelect = InferSelectModel<typeof examQuestionOptions>;
export type SchemaExamQuestionOptionInsert = InferInsertModel<typeof examQuestionOptions>;
