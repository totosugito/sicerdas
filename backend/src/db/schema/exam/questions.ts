import { pgTable, uuid, varchar, timestamp, integer, jsonb, index, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { EnumDifficultyLevel, EnumQuestionType, PgEnumDifficultyLevel, PgEnumQuestionType } from './enums.ts';
import { examPassages } from './passages.ts';
import { examSubjects } from './subjects.ts';
import { educationGrades } from '../education/education.ts';
import { appTier } from '../app/app-tier.ts';

/**
 * Table: exam_questions
 * 
 * The central repository for question content. This table holds the actual 
 * questions that will be distributed into various exam packages.
 */
export const examQuestions = pgTable('exam_questions', {
    // Unique identifier for the question
    id: uuid('id').primaryKey().defaultRandom(),

    // Optional link to a passage if the question belongs to a reading context
    passageId: uuid('passage_id').references(() => examPassages.id, { onDelete: 'set null' }),

    // Mandatory link to a subject (e.g., this is a Math question)
    subjectId: uuid('subject_id').references(() => examSubjects.id, { onDelete: 'restrict' }).notNull(),

    // Rich text content of the question stored in BlockNote JSON format
    content: jsonb('content').$type<Record<string, unknown>[]>().notNull(),

    // Difficulty level of the question (easy, medium, hard)
    difficulty: PgEnumDifficultyLevel('difficulty').default(EnumDifficultyLevel.MEDIUM).notNull(),

    // Type of the question (Multiple Choice, Essay, etc.)
    type: PgEnumQuestionType('type').default(EnumQuestionType.MULTIPLE_CHOICE).notNull(),

    // Access Gate: Minimum subscription tier required to view this question's details
    requiredTier: varchar('required_tier', { length: 50 }).references(() => appTier.slug, { onDelete: 'set null' }).default('free'),

    // Target Audience: The educational level/grade this question is meant for
    educationGradeId: integer('education_grade_id').references(() => educationGrades.id, { onDelete: 'set null' }),

    // Control flag to softly hide questions without deleting them
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamp when this question was created
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this question was last updated
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('exam_questions_subject_id_idx').on(table.subjectId),
    index('exam_questions_passage_id_idx').on(table.passageId),
    index('exam_questions_grade_tier_idx').on(table.educationGradeId, table.requiredTier),
]);

export type SchemaExamQuestionSelect = InferSelectModel<typeof examQuestions>;
export type SchemaExamQuestionInsert = InferInsertModel<typeof examQuestions>;
