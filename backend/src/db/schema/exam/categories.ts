import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Table: exam_categories
 * 
 * Defines macro-level groupings for exams. This is the highest level of organization
 * in the assessment system. Examples include 'UTBK', 'CPNS', or 'Daily Practice'.
 */
export const examCategories = pgTable('exam_categories', {
    // Unique identifier for the category
    id: uuid('id').primaryKey().defaultRandom(),

    // Display name of the category (e.g., 'CPNS 2026', 'UTBK SNBT')
    name: varchar('name', { length: 255 }).notNull(),

    // Detailed description of what this category entails
    description: text('description'),

    // Control flag to softly hide categories without deleting them
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamp when this category was created
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this category was last updated
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SchemaExamCategorySelect = InferSelectModel<typeof examCategories>;
export type SchemaExamCategoryInsert = InferInsertModel<typeof examCategories>;
