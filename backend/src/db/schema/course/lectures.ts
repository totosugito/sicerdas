import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { courseChapters } from "./chapters.ts";
import { EnumLectureType, PgEnumLectureType } from "./enums.ts";
import { users } from "../users/users.ts";

/**
 * Table: lectures
 *
 * This table stores lectures which are containers for content within chapters.
 *
 * Fields:
 * - id: Unique identifier for the lecture
 * - title: Title of the lecture
 * - description: Description of the lecture content
 * - chapterId: Reference to the chapter this lecture belongs to
 * - createdByUserId: Reference to the user who created the lecture
 * - type: Type of the lecture (video, quiz, text, etc.)
 * - referenceUrl: Reference to external content, resource ID, or section ID (max 255 characters):
 *   - For TEXT types: Stores the `course_lecture_texts.id` UUID of the standalone rich text article.
 *   - For EXAM types: Stores the `sectionId` of the hidden `course_exam` package section.
 * - extra: JSONB field for storing type-specific metadata (e.g., successThreshold for exams)
 * - isActive: Whether the lecture is active or not
 * - position: The order in which lectures are displayed within a chapter (fractional indexing)
 * - createdAt: When the lecture was created
 * - updatedAt: When the lecture was last updated
 */
export const courseLectures = pgTable(
  "course_lectures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => courseChapters.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    type: PgEnumLectureType("type").notNull().default(EnumLectureType.TEXT),
    referenceUrl: varchar("reference_url", { length: 255 }),
    extra: jsonb("extra").$type<{
      successThreshold?: number;
    } & Record<string, unknown>>().default({}),
    isActive: boolean("is_active").notNull().default(true),
    position: numeric("position", { precision: 10, scale: 10 }).notNull().default("1.0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("lectures_chapter_id_idx").on(table.chapterId),
    index("lectures_creator_idx").on(table.createdByUserId),
    index("lectures_type_idx").on(table.type),
    index("lectures_is_active_idx").on(table.isActive),
    index("lectures_created_at_idx").on(table.createdAt),
  ],
);

export type SchemaLectureSelect = InferSelectModel<typeof courseLectures>;
export type SchemaLectureInsert = InferInsertModel<typeof courseLectures>;
