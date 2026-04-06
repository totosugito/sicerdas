import { pgTable, uuid, varchar, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "../user/users.ts";

/**
 * Table: content_categories
 *
 * Defines macro-level groupings for exams and courses. This is the highest level of organization
 * in the learning management system. Examples include 'UTBK', 'CPNS', or 'Daily Practice'.
 */
export const educationCategories = pgTable(
  "education_categories",
  {
    // Unique identifier for the category
    id: uuid("id").primaryKey().defaultRandom(),

    // Display name of the category (e.g., 'CPNS 2026', 'UTBK SNBT')
    name: varchar("name", { length: 255 }).notNull(),

    // Unique machine-readable identifier (e.g., 'ujian-nasional')
    // Used for search and human-friendly identification
    key: varchar("key", { length: 255 }).notNull().unique(),

    // Detailed description of what this category entails
    description: text("description"),

    // Tracks the user who created this category
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Control flag to softly hide categories without deleting them
    isActive: boolean("is_active").default(true).notNull(),

    // Timestamp when this category was created
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this category was last updated
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("education_categories_creator_idx").on(table.createdByUserId)],
);

export type SchemaEducationCategorySelect = InferSelectModel<typeof educationCategories>;
export type SchemaEducationCategoryInsert = InferInsertModel<typeof educationCategories>;
