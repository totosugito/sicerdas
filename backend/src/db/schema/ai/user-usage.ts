import { pgTable, varchar, timestamp, uuid, integer, jsonb, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';
import { appTier } from '../app/app-tier.ts';
import { EnumUsageType, PgEnumUsageType } from '../enum/enum-app.ts';

/**
 * Table: ai_user_usage
 * 
 * This table tracks the AI usage of a user for a specific billing period or cycle.
 * It is used to enforce tier limits (e.g., max tokens per month).
 * 
 * Fields:
 * - id: Unique identifier
 * - userId: The user
 * - tierId: The tier the user was on during this usage period (snapshot for audit)
 * - type: The type of usage record (daily or monthly)
 * - periodStart: Start of the usage period
 * - periodEnd: End of the usage period
 * - tokensUsed: Total tokens used in this period
 * - requestCount: Total number of requests made
 * - extra: JSONB for breakdown by model or other stats if needed
 */
export const aiUserUsage = pgTable('ai_user_usage', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),

    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    tierId: varchar('tier_id', { length: 50 })
        .references(() => appTier.slug, { onDelete: 'set null', onUpdate: 'cascade' }),

    type: PgEnumUsageType('type').notNull().default(EnumUsageType.MONTHLY),

    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
    periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),

    tokensUsed: integer('tokens_used').notNull().default(0),
    requestCount: integer('request_count').notNull().default(0),

    // Potential for detailed breakdown, e.g. { "gpt-4": 100, "claude-3": 200 }
    extra: jsonb('extra').$type<Record<string, any>>().default({}),

    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('ai_user_usage_period_idx').on(table.userId, table.periodStart, table.periodEnd),
    index('ai_user_usage_type_idx').on(table.type),
]);

export type SchemaAiUserUsageSelect = InferSelectModel<typeof aiUserUsage>;
export type SchemaAiUserUsageInsert = InferInsertModel<typeof aiUserUsage>;
