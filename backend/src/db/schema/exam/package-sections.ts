import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  index,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { examPackages } from "./packages.ts";
import { users } from "../user/users.ts";
import { appVersion } from "../app/app-version.ts";

/**
 * Table: exam_package_sections
 *
 * Divides an exam package into logical sections (e.g., Literasi Bahasa, Penalaran Matematika).
 * Each section can have its own duration.
 */
export const examPackageSections = pgTable(
  "exam_package_sections",
  {
    // Unique identifier for the section
    id: uuid("id").primaryKey().defaultRandom(),

    // The parent exam package
    packageId: uuid("package_id")
      .references(() => examPackages.id, { onDelete: "cascade" })
      .notNull(),

    // Title of the section (e.g., "Sub-test Literasi")
    title: varchar("title", { length: 255 }).notNull(),

    // Optional logical grouping (e.g., "TPS", "Basic Arithmetic") used purely for UI categorization
    groupName: varchar("group_name", { length: 255 }),

    // Optional description providing more details about this section
    description: text("description"),

    // Individual timer for this section in minutes (if any). Omit to use package global duration.
    durationMinutes: integer("duration_minutes").default(0).notNull(),

    // Sorting order within the package
    order: integer("order").default(1).notNull(),

    // Tracks the user who created this section
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Soft delete / hide flag
    isActive: boolean("is_active").default(true).notNull(),

    // References the version of this section
    versionId: integer("version_id").references(() => appVersion.id, { onDelete: "set null" }),

    // Active/Total counters for questions (Denormalization for scale)
    totalQuestions: integer("total_questions").default(0).notNull(),
    activeQuestions: integer("active_questions").default(0).notNull(),

    // Timestamp when this section was created
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this section was last updated
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("exam_package_sections_version_id_idx").on(table.versionId),
    index("exam_package_sections_package_id_idx").on(table.packageId),
    index("exam_package_sections_creator_idx").on(table.createdByUserId),
    index("idx_section_total_questions").on(table.totalQuestions),
    index("idx_section_active_questions").on(table.activeQuestions),
  ],
);

export type SchemaExamPackageSectionSelect = InferSelectModel<typeof examPackageSections>;
export type SchemaExamPackageSectionInsert = InferInsertModel<typeof examPackageSections>;
