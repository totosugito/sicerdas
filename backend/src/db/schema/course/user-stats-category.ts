import { index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';
import { educationCategories } from '../education/education-categories.ts';

/**
 * Table: course_user_stats_category
 * 
 * Stores specific performance metrics segmented by course category.
 * Used to analyze learning trends (e.g. "User enrolls in IT courses mostly").
 */
export const courseUserStatsCategory = pgTable('course_user_stats_category', {
    // Unique identifier for the category record
    id: uuid('id').primaryKey().defaultRandom(),

    // Category and User relationship
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    categoryId: uuid('category_id').references(() => educationCategories.id, { onDelete: 'cascade' }).notNull(),

    // Analytical counters
    coursesEnrolled: integer('courses_enrolled').default(0).notNull(),
    coursesCompleted: integer('courses_completed').default(0).notNull(),

    // Timestamp representing the last time this specific aggregate was incremented
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('course_user_stats_category_lookup_idx').on(table.userId, table.categoryId),
]);

export type SchemaCourseUserStatCategorySelect = InferSelectModel<typeof courseUserStatsCategory>;
export type SchemaCourseUserStatCategoryInsert = InferInsertModel<typeof courseUserStatsCategory>;
