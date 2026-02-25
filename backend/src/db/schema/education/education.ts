import { pgTable, varchar, timestamp, text, jsonb, serial } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Table: education_grades
 * 
 * This table stores educational grade levels used to categorize content by educational level.
 * Each record represents a distinct grade level with associated metadata.
 * 
 * Fields:
 * - id: Unique serial identifier for the grade record
 * - grade: Short code or identifier for the grade level (e.g., '1', '2', 'K', 'HS')
 * - name: Full descriptive name for the grade level (e.g., 'Grade 1', 'Kindergarten', 'High School')
 * - desc: Optional textual description of the grade level
 * - extra: JSONB field for storing additional structured data without requiring schema changes
 * - createdAt: When this grade record was created
 * - updatedAt: When this grade record was last updated
 * 
 * Design Notes:
 * - The grade field is unique to prevent duplicate grade levels
 * - The name field provides a human-readable description of the grade
 * - The extra field allows for flexible storage of grade-specific metadata
 *   without requiring database migrations
 * - This table is referenced by other content tables to associate content with grade levels
 */
export const educationGrades = pgTable('education_grade', {
  id: serial('id').primaryKey().notNull(),
  grade: varchar('grade', { length: 32 }).unique().notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  desc: text('desc')
    .default(''),
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type SchemaEducationGradeSelect = InferSelectModel<typeof educationGrades>;
export type SchemaEducationGradeInsert = InferInsertModel<typeof educationGrades>;