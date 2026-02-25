import { pgTable, uuid, timestamp, decimal, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { EnumExamSessionStatus, PgEnumExamSessionStatus } from './enums.ts';
import { users } from '../user/users.ts';
import { examPackages } from './packages.ts';

/**
 * Table: exam_sessions
 * 
 * Tracks an active or historical attempt by a specific user on an exam package.
 * It serves as a stopwatch and final score recorder.
 */
export const examSessions = pgTable('exam_sessions', {
    // Unique identifier for the user's attempt session
    id: uuid('id').primaryKey().defaultRandom(),

    // User taking the exam
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    // The exam package being taken
    packageId: uuid('package_id').references(() => examPackages.id, { onDelete: 'restrict' }).notNull(),

    // Current status of the exam (e.g., in_progress, completed)
    status: PgEnumExamSessionStatus('status').default(EnumExamSessionStatus.IN_PROGRESS).notNull(),

    // Exact time the user clicked "Start"
    startTime: timestamp('start_time', { withTimezone: true }).defaultNow().notNull(),

    // Exact time the system auto-submitted or user manually submitted
    endTime: timestamp('end_time', { withTimezone: true }),

    // Final calculated score for the entire session. Uses decimal to support IRT grading systems.
    score: decimal('score', { precision: 10, scale: 2 }),

    // Timestamp when this session was created
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this session was last updated
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('exam_sessions_user_id_idx').on(table.userId),
    index('exam_sessions_package_id_idx').on(table.packageId),
    index('exam_sessions_status_idx').on(table.status),
]);

export type SchemaExamSessionSelect = InferSelectModel<typeof examSessions>;
export type SchemaExamSessionInsert = InferInsertModel<typeof examSessions>;
