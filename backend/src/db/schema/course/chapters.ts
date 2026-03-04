import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { boolean, index, jsonb, numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { courses } from './courses.ts';

/**
 * Table: chapters
 * 
 * This table stores course chapters which are containers for lectures.
 * 
 * Fields:
 * - id: Unique identifier for the chapter
 * - chapterName: Name of the chapter
 * - courseId: Reference to the course this chapter belongs to
 * - extra: JSONB field for storing additional structured data without requiring schema changes
 * - isActive: Whether the chapter is active or not
 * - position: The order in which chapters are displayed within a course (fractional indexing)
 * - createdAt: When the chapter was created
 * - updatedAt: When the chapter was last updated
 */
export const courseChapters = pgTable('course_chapters', {
    id: uuid('id').primaryKey().defaultRandom(),
    chapterName: varchar('chapter_name', { length: 255 }),
    courseId: uuid('course_id')
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    extra: jsonb('extra')
        .$type<Record<string, unknown>>()
        .default({}),
    isActive: boolean('is_active').notNull().default(true),
    position: numeric('position', { precision: 10, scale: 10 }).notNull().default('1.0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('chapters_course_id_idx').on(table.courseId),
    index('chapters_is_active_idx').on(table.isActive),
    index('chapters_created_at_idx').on(table.createdAt),
]);

export type SchemaChapterSelect = InferSelectModel<typeof courseChapters>;
export type SchemaChapterInsert = InferInsertModel<typeof courseChapters>;
