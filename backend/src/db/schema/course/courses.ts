import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from '../user/users.ts';
import { EnumCourseStatus, PgEnumCourseStatus, EnumPublishDateType, PgEnumPublishDateType } from './enums.ts';
import { educationCategories } from '../education/categories.ts';

/**
 * Table: courses
 * 
 * This table stores course information including metadata, content structure, and publication status.
 * Courses are the primary educational content units in the system.
 * 
 * Fields:
 * - id: Unique identifier for the course
 * - createdBy: Reference to the user who created the course
 * - courseCode: Public identifier for the course (unique)
 * - courseName: Name/title of the course
 * - courseDescription: Detailed description of the course content
 * - whatYouWillLearn: Description of learning outcomes
 * - price: Price of the course (default: 0)
 * - thumbnail: URL to course thumbnail image
 * - categoryId: Reference to the course category
 * - tags: Array of tags associated with the course
 * - instructions: instructions for the course
 * - status: Publication status of the course (active, inactive, archived, deleted)
 * - publishDateType: Type of publication date setting
 * - publishDateStart: Start date for course publication
 * - publishDateEnd: End date for course publication
 * - isPublic: Whether the course is publicly accessible
 * - isSequential: Whether the course is sequential (i.e., lectures must be completed in order)
 * - extra: JSONB field for storing additional structured data without requiring schema changes
 * - createdAt: When the course was created
 * - updatedAt: When the course was last updated
 * 
 * Relationships:
 * - categoryId references contentCategories(id)
 * - Sections are stored in a separate chapters table with course_id reference
 * - Students are tracked in a separate course_enrollments table
 */
export const courses = pgTable('courses', {
    id: uuid('id').primaryKey().defaultRandom(),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    courseCode: varchar('course_code', { length: 255 }).notNull().unique(),
    courseName: varchar('course_name', { length: 255 }),
    courseDescription: text('course_description'),
    whatYouWillLearn: text('what_you_will_learn'),
    price: integer('price').default(0),
    thumbnail: text('thumbnail'),
    categoryId: uuid('category_id').references(() => educationCategories.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    tags: text('tags').array(),
    instructions: text('instructions'),
    status: PgEnumCourseStatus('status').default(EnumCourseStatus.DRAFT),
    publishDateType: PgEnumPublishDateType('publish_date_type').default(EnumPublishDateType.NOW),
    publishDateStart: timestamp('publish_date_start'),
    publishDateEnd: timestamp('publish_date_end'),
    isPublic: boolean('is_public').notNull().default(false),
    isSequential: boolean('is_sequential').notNull().default(true),
    extra: jsonb('extra')
        .$type<Record<string, unknown>>()
        .default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (table) => [
    index('courses_created_by_idx').on(table.createdBy),
    index('courses_category_id_idx').on(table.categoryId),
    index('courses_status_idx').on(table.status),
    index('courses_is_public_idx').on(table.isPublic),
    index('courses_created_at_idx').on(table.createdAt),
]);

export type SchemaCourseSelect = InferSelectModel<typeof courses>;
export type SchemaCourseInsert = InferInsertModel<typeof courses>;
