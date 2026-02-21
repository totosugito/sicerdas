import { pgTable, text, timestamp, index, serial, jsonb, integer } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import {
    EnumJobStatus, PgEnumJobStatus,
    EnumJobTrigger, PgEnumJobTrigger,
    EnumJobGroup, PgEnumJobGroup
} from '../enum/enum-general.ts';

export type SchemaJobLogInsert = InferInsertModel<typeof jobLogs>;
export type SchemaJobLogSelect = InferSelectModel<typeof jobLogs>;

/**
 * Scheduled Job Logs
 * 
 * Generic table to track the execution of background jobs and scheduled tasks.
 * Stores status, duration, and structured results/errors in JSONB.
 */
export const jobLogs = pgTable('job_logs', {
    id: serial('id').primaryKey().notNull(),

    // Job identification
    jobName: text('job_name').notNull(),
    group: PgEnumJobGroup('group').default(EnumJobGroup.DEFAULT), // To group related jobs (e.g. 'daily', 'maintenance')

    // Execution status & Timing
    status: PgEnumJobStatus('status').notNull().default(EnumJobStatus.PENDING),
    triggeredBy: PgEnumJobTrigger('triggered_by').default(EnumJobTrigger.SYSTEM), // 'system', 'manual', 'api'

    startTime: timestamp('start_time').defaultNow().notNull(),
    endTime: timestamp('end_time'),
    durationMs: integer('duration_ms'),

    // Results & Errors
    result: jsonb('result')
        .$type<Record<string, unknown>>()
        .default({}),
    error: text('error'), // Stack trace or error message

    createdAt: timestamp('created_at').defaultNow().notNull(),

}, (table) => [
    index('job_logs_name_index').on(table.jobName),
    index('job_logs_status_index').on(table.status),
    index('job_logs_start_time_index').on(table.startTime),
    index('job_logs_group_index').on(table.group),
]);
