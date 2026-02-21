import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
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

    // Timestamp when this tag was created
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SchemaExamTagSelect = InferSelectModel<typeof examTags>;
export type SchemaExamTagInsert = InferInsertModel<typeof examTags>;
