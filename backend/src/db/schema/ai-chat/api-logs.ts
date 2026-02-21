import { pgTable, timestamp, uuid, integer, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { aiModels } from './models.ts';

/**
 * Table: ai_api_logs
 * 
 * This table stores aggregated AI API statistics per hour for analytics and monitoring.
 * 
 * **Purpose:**
 * - Track model performance over time (success rates, response times, token usage)
 * - Enable historical analysis and trend detection
 * - Support billing and cost tracking via token counts
 * - Monitor system health and identify problematic models
 * 
 * **Data Population:**
 * - Populated by hourly scheduled job (cron/scheduler)
 * - Aggregates data from `aiChatMessages` table
 * - Each record represents one hour of activity for one model
 * 
 * **Performance Benefits:**
 * - Reduces database load by avoiding real-time statistics calculation
 * - Pre-aggregated data enables fast dashboard queries
 * - Scales to millions of messages without performance degradation
 * 
 * **Fields:**
 * - id: Unique identifier for this aggregation record
 * - modelId: Reference to the AI model (required, cascades on delete)
 * - periodStart: Start of the hourly period (e.g., 2024-01-01 14:00:00)
 * - periodEnd: End of the hourly period (e.g., 2024-01-01 15:00:00)
 * - successCount: Number of successful API calls in this period
 * - failureCount: Number of failed API calls in this period
 * - totalRequests: Total requests (successCount + failureCount)
 * - avgDuration: Average response time in milliseconds for this period
 * - totalTokens: Total tokens consumed in this period (for billing)
 * - createdAt: When this aggregation record was created
 * 
 * **Indexes:**
 * - modelId: Fast lookups by model
 * - periodStart, periodEnd: Time-range queries
 * - (modelId, periodStart): Composite index for efficient model+time filtering
 * 
 * **Example Query:**
 * ```sql
 * -- Get last 24 hours of stats for a specific model
 * SELECT * FROM ai_api_logs 
 * WHERE model_id = 'xxx' 
 *   AND period_start >= NOW() - INTERVAL '24 hours'
 * ORDER BY period_start DESC;
 * ```
 */
export const aiApiLogs = pgTable('ai_api_logs', {
    id: uuid().primaryKey().notNull().defaultRandom(),

    // Reference to the model used
    modelId: uuid('model_id')
        .notNull()
        .references(() => aiModels.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    // Aggregation period
    periodStart: timestamp('period_start').notNull(), // Start of hour (e.g., 2024-01-01 14:00:00)
    periodEnd: timestamp('period_end').notNull(),     // End of hour (e.g., 2024-01-01 15:00:00)

    // Aggregated metrics
    successCount: integer('success_count').notNull().default(0),
    failureCount: integer('failure_count').notNull().default(0),
    totalRequests: integer('total_requests').notNull().default(0), // successCount + failureCount

    avgDuration: integer('avg_duration'), // Average duration in milliseconds
    totalTokens: integer('total_tokens'), // Total tokens used in this period

    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('ai_api_logs_model_id_idx').on(table.modelId),
    index('ai_api_logs_period_start_idx').on(table.periodStart),
    index('ai_api_logs_period_end_idx').on(table.periodEnd),
    // Composite index for efficient queries by model and time range
    index('ai_api_logs_model_period_idx').on(table.modelId, table.periodStart),
]);

export type SchemaAiApiLogSelect = InferSelectModel<typeof aiApiLogs>;
export type SchemaAiApiLogInsert = InferInsertModel<typeof aiApiLogs>;
