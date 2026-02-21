import { pgTable, uuid, primaryKey, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { examQuestions } from './questions.ts';
import { examTags } from './tags.ts';

/**
 * Table: exam_question_tags
 * 
 * Many-to-Many junction table linking questions to their respective tags.
 * This powers the custom "Adaptive Learning" generation feature.
 */
export const examQuestionTags = pgTable('exam_question_tags', {
    // The question being tagged
    questionId: uuid('question_id').references(() => examQuestions.id, { onDelete: 'cascade' }).notNull(),

    // The tag being applied to the question
    tagId: uuid('tag_id').references(() => examTags.id, { onDelete: 'cascade' }).notNull(),
}, (t) => [
    primaryKey({ columns: [t.questionId, t.tagId] }),
    index('exam_question_tags_tag_id_idx').on(t.tagId)
]);

export type SchemaExamQuestionTagSelect = InferSelectModel<typeof examQuestionTags>;
export type SchemaExamQuestionTagInsert = InferInsertModel<typeof examQuestionTags>;
