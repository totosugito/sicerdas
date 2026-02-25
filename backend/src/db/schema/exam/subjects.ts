import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Table: exam_subjects
 * 
 * Defines specific subjects or sub-tests. For example, in a CPNS exam grouping,
 * the subjects could be TIU (Tes Intelegensia Umum) or TWK (Tes Wawasan Kebangsaan).
 */
export const examSubjects = pgTable('exam_subjects', {
    // Unique identifier for the subject
    id: uuid('id').primaryKey().defaultRandom(),

    // Display name of the subject (e.g., 'Mathematics', 'TIU')
    name: varchar('name', { length: 255 }).notNull(),

    // Detailed description or syllabus summary for this subject
    description: text('description'),

    // Control flag to softly hide subjects without deleting them
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamp when this subject was created
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this subject was last updated
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SchemaExamSubjectSelect = InferSelectModel<typeof examSubjects>;
export type SchemaExamSubjectInsert = InferInsertModel<typeof examSubjects>;
