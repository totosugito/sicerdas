import { pgTable, uuid, primaryKey, integer } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { examPackages } from './packages.ts';
import { examPackageSections } from './package-sections.ts';
import { examQuestions } from './questions.ts';

/**
 * Table: exam_package_questions
 * 
 * Many-to-Many junction table specifying exactly which overarching questions
 * belong inside an exam bundle, along with their default ordering sequence.
 */
export const examPackageQuestions = pgTable('exam_package_questions', {
    // Exam package identifier
    packageId: uuid('package_id').references(() => examPackages.id, { onDelete: 'cascade' }).notNull(),

    // Question identifier
    questionId: uuid('question_id').references(() => examQuestions.id, { onDelete: 'cascade' }).notNull(),

    // Optional link to a section within the package
    sectionId: uuid('section_id').references(() => examPackageSections.id, { onDelete: 'set null' }),

    // Default numerical order of appearance in the exam
    order: integer('order').notNull(),
}, (t) => [
    primaryKey({ columns: [t.packageId, t.questionId] })
]);

export type SchemaExamPackageQuestionSelect = InferSelectModel<typeof examPackageQuestions>;
export type SchemaExamPackageQuestionInsert = InferInsertModel<typeof examPackageQuestions>;
