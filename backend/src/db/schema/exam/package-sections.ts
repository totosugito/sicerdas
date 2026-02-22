import { pgTable, uuid, varchar, timestamp, integer, index, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { examPackages } from './packages.ts';

/**
 * Table: exam_package_sections
 * 
 * Divides an exam package into logical sections (e.g., Literasi Bahasa, Penalaran Matematika).
 * Each section can have its own duration.
 */
export const examPackageSections = pgTable('exam_package_sections', {
    // Unique identifier for the section
    id: uuid('id').primaryKey().defaultRandom(),

    // The parent exam package
    packageId: uuid('package_id').references(() => examPackages.id, { onDelete: 'cascade' }).notNull(),

    // Title of the section (e.g., "Sub-test Literasi")
    title: varchar('title', { length: 255 }).notNull(),

    // Individual timer for this section in minutes (if any). Omit to use package global duration.
    durationMinutes: integer('duration_minutes'),

    // Sorting order within the package
    order: integer('order').default(1).notNull(),

    // Soft delete / hide flag
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamp when this section was created
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // Timestamp when this section was last updated
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('exam_package_sections_package_id_idx').on(table.packageId),
]);

export type SchemaExamPackageSectionSelect = InferSelectModel<typeof examPackageSections>;
export type SchemaExamPackageSectionInsert = InferInsertModel<typeof examPackageSections>;
