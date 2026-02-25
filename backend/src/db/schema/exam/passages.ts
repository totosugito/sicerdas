import { pgTable, uuid, varchar, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Table: exam_passages
 * 
 * Stores long reading passages, graphs, or context blocks that apply to 
 * multiple questions simultaneously (e.g., reading comprehension passages).
 */
export const examPassages = pgTable('exam_passages', {
    // Unique identifier for the passage
    id: uuid('id').primaryKey().defaultRandom(),

    // Internal title or reference name for the passage (e.g., 'Reading 1: Economics')
    title: varchar('title', { length: 255 }),

    // Rich text content of the passage stored in BlockNote JSON format
    content: jsonb('content').$type<Record<string, unknown>[]>().notNull(),

    // Control flag to softly hide passages without deleting them
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamp when this passage was created
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this passage was last updated
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SchemaExamPassageSelect = InferSelectModel<typeof examPassages>;
export type SchemaExamPassageInsert = InferInsertModel<typeof examPassages>;
