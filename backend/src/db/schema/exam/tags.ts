import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Table: exam_tags
 * 
 * A dictionary/catalog of topics or tags used to classify questions for 
 * targeted learning (e.g., 'Algebra', 'HOTS', 'Syllogisms').
 */
export const examTags = pgTable('exam_tags', {
    // Unique identifier for the tag
    id: uuid('id').primaryKey().defaultRandom(),

    // Unique name of the tag/topic
    name: varchar('name', { length: 100 }).unique().notNull(),

    // Optional description of the topic
    description: text('description'),

    // Control flag to softly hide tags without deleting them
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamp when this tag was created
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // Timestamp when this tag was last updated
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SchemaExamTagSelect = InferSelectModel<typeof examTags>;
export type SchemaExamTagInsert = InferInsertModel<typeof examTags>;
