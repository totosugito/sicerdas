import { pgTable, uuid, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { educationCategories } from "./categories.ts";
import { educationGrades } from "./grades.ts";
import { PgEnumContentType } from "../enum/enum-app.ts";

/**
 * Table: education_category_grade_stats
 *
 * This table maintains statistical counts of content (exams, books, courses, etc.)
 * grouped by education category and grade level. It supports multiple content types
 * using the EnumContentType.
 *
 * Fields:
 * - id: Unique UUID identifier for the stats record
 * - contentType: The type of content (e.g., 'exam', 'book')
 * - categoryId: Reference to education_categories
 * - educationGradeId: Reference to education_grades
 * - totalCount: Total count of items (including inactive)
 * - activeCount: Count of active/published items
 * - updatedAt: Last time these stats were synchronized
 */
export const educationCategoryGradeStats = pgTable(
  "education_category_grade_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentType: PgEnumContentType("content_type").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => educationCategories.id, { onDelete: "cascade" }),
    educationGradeId: integer("education_grade_id")
      .notNull()
      .references(() => educationGrades.id, { onDelete: "cascade" }),

    totalCount: integer("total_count").notNull().default(0),
    activeCount: integer("active_count").notNull().default(0),

    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Ensure unique combination of content type, category, and grade
    uniqueCombo: unique("education_category_grade_unique_combo").on(
      table.contentType,
      table.categoryId,
      table.educationGradeId,
    ),
    contentTypeIdx: index("education_category_grade_content_type_idx").on(table.contentType),
    categoryIdx: index("education_category_grade_category_idx").on(table.categoryId),
    gradeIdx: index("education_category_grade_grade_idx").on(table.educationGradeId),
  }),
);

export type SchemaEducationCategoryGradeStatSelect = InferSelectModel<
  typeof educationCategoryGradeStats
>;
export type SchemaEducationCategoryGradeStatInsert = InferInsertModel<
  typeof educationCategoryGradeStats
>;
