import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { index, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { courses } from './courses.ts';
import { users } from '../user/users.ts';
import { EnumEnrollmentStatus, PgEnumEnrollmentStatus } from './enums.ts';

/**
 * Table: course_enrollments
 * 
 * This table tracks which students are enrolled in which courses.
 * It provides a direct link between users and courses for enrollment management.
 * 
 * Fields:
 * - id: Unique identifier for the enrollment record
 * - courseId: Reference to the course
 * - userId: Reference to the user (student)
 * - enrolledAt: When the user enrolled in the course
 * - status: Enrollment status (active, completed, dropped, etc.)
 * - completedAt: When the user completed the course (if applicable)
 * - extra: JSONB field for storing additional structured data without requiring schema changes
 * 
 * Design Notes:
 * - This table provides a direct relationship between users and courses
 * - Status field supports different enrollment states
 * - CompletedAt helps with completion analytics
 */
export const courseEnrollments = pgTable('course_enrollments', {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
    status: PgEnumEnrollmentStatus('status').notNull().default(EnumEnrollmentStatus.ACTIVE),
    completedAt: timestamp('completed_at'),
    extra: jsonb('extra')
        .$type<Record<string, unknown>>()
        .default({}),
}, (table) => [
    index('course_enrollments_course_id_idx').on(table.courseId),
    index('course_enrollments_user_id_idx').on(table.userId),
    index('course_enrollments_status_idx').on(table.status),
    index('course_enrollments_enrolled_at_idx').on(table.enrolledAt),
    index('course_enrollments_course_user_idx').on(table.courseId, table.userId),
]);

export type SchemaCourseEnrollmentSelect = InferSelectModel<typeof courseEnrollments>;
export type SchemaCourseEnrollmentInsert = InferInsertModel<typeof courseEnrollments>;
