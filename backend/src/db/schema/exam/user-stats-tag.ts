import { pgTable, uuid, timestamp, integer, decimal, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';
import { examTags } from './tags.ts';

/**
 * Table: exam_user_stats_tag
 * 
 * Hyper-granular analytics tracking user proficiency per Topic/Tag.
 * This is the fuel for 'Adaptive Learning AI Recommendation' engines 
 * to detect specific weaknesses like "Low accuracy in Syllogism Questions".
 */
export const examUserStatsTag = pgTable('exam_user_stats_tag', {
    // Unique identifier for the tag record
    id: uuid('id').primaryKey().defaultRandom(),

    // Metric mapping between the user and a specific tag/topic
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    tagId: uuid('tag_id').references(() => examTags.id, { onDelete: 'cascade' }).notNull(),

    // Counter metrics mapped only against this tag
    totalQuestionsAnswered: integer('total_questions_answered').default(0).notNull(),
    totalCorrect: integer('total_correct').default(0).notNull(),
    totalWrong: integer('total_wrong').default(0).notNull(),

    // Localized accuracy rate (%) used to trigger Custom Practice popup suggestions
    accuracyRate: decimal('accuracy_rate', { precision: 5, scale: 2 }).default('0').notNull(),

    // Timestamp tracking data freshness for the Cron reconciliation script
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('exam_user_stats_tag_lookup_idx').on(table.userId, table.tagId),
]);

export type SchemaExamUserStatTagSelect = InferSelectModel<typeof examUserStatsTag>;
export type SchemaExamUserStatTagInsert = InferInsertModel<typeof examUserStatsTag>;
