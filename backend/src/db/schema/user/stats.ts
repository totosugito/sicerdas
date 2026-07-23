import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { date, integer, jsonb, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { PgEnumStatsPeriodType } from '../enum/enum-general.ts';

/**
 * Table: users_stats
 * 
 * Pre-aggregated snapshot metrics for user analytics (daily, weekly, monthly).
 * Allows sub-millisecond query performance on dashboard analytics charts.
 */
export const usersStats = pgTable('users_stats', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    
    // Period Granularity & Identifier
    periodType: PgEnumStatsPeriodType('period_type').notNull(),
    periodKey: varchar('period_key', { length: 20 }).notNull(), // 'YYYY-MM-DD', 'YYYY-Www', 'YYYY-MM'
    date: date('date').notNull(),

    // Aggregated Metrics
    newUsersCount: integer('new_users_count').notNull().default(0),
    totalUsersCount: integer('total_users_count').notNull().default(0),
    activeUsersCount: integer('active_users_count').notNull().default(0),
    bannedUsersCount: integer('banned_users_count').notNull().default(0),

    // Structured JSONB Breakdowns
    roleBreakdown: jsonb('role_breakdown')
        .$type<{ admin: number; teacher: number; user: number; guest: number }>()
        .notNull()
        .default({ admin: 0, teacher: 0, user: 0, guest: 0 }),
    tierBreakdown: jsonb('tier_breakdown')
        .$type<Record<string, number>>()
        .notNull()
        .default({}),
    educationBreakdown: jsonb('education_breakdown')
        .$type<Record<string, number>>()
        .notNull()
        .default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex('users_stats_period_key_idx').on(table.periodType, table.periodKey),
]);

export type UsersStats = InferSelectModel<typeof usersStats>;
export type SchemaUsersStatsSelect = InferSelectModel<typeof usersStats>;
export type SchemaUsersStatsInsert = InferInsertModel<typeof usersStats>;
