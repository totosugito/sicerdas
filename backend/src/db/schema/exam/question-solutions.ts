import { pgTable, uuid, varchar, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { EnumSolutionType, PgEnumSolutionType } from './enums.ts';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { examQuestions } from './questions.ts';
import { tierPricing } from '../tier-pricing.ts';

/**
 * Table: exam_question_solutions
 * 
 * Stores multi-method solutions for a single question. Supports providing 
 * "General Methods", "Fast Methods / Tricks", or general "Tips".
 */
export const examQuestionSolutions = pgTable('exam_question_solutions', {
    // Unique identifier for the solution
    id: uuid('id').primaryKey().defaultRandom(),

    // The question this solution explains
    questionId: uuid('question_id').references(() => examQuestions.id, { onDelete: 'cascade' }).notNull(),

    // Title of the solution method (e.g., 'The King Method')
    title: varchar('title', { length: 255 }).notNull(),

    // Rich text content of the explanation stored in BlockNote JSON format
    content: jsonb('content').$type<Record<string, unknown>[]>().notNull(),

    // The classification of this solution (general, fast_method, etc)
    solutionType: PgEnumSolutionType('solution_type').default(EnumSolutionType.GENERAL).notNull(),

    // Ordering for display prioritization
    order: integer('order').notNull().default(0),

    // Access Gate: Minimum subscription tier required to view this specific solution trick
    requiredTier: varchar('required_tier', { length: 50 }).references(() => tierPricing.slug, { onDelete: 'set null' }).default('free'),

    // Timestamp when this solution was created
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // Timestamp when this solution was last updated
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('exam_question_solutions_question_id_idx').on(table.questionId),
    index('exam_question_solutions_tier_idx').on(table.requiredTier),
]);

export type SchemaExamQuestionSolutionSelect = InferSelectModel<typeof examQuestionSolutions>;
export type SchemaExamQuestionSolutionInsert = InferInsertModel<typeof examQuestionSolutions>;
