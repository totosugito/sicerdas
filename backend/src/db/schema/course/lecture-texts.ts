import { pgTable, uuid, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "../users/users.ts";

/**
 * Table: course_lecture_texts
 * 
 * Stores standalone rich text articles (BlockNote JSON format).
 * Can be referenced by course lectures via `referenceUrl` (storing the course_lecture_texts UUID).
 * Deleting a lecture does NOT delete the referenced lecture text.
 * 
 * Fields:
 * - id: Unique identifier (UUID)
 * - title: Descriptive title/name for searching and dropdown selection
 * - content: Rich text content stored as BlockNote JSON array
 * - createdByUserId: Reference to user who created the content
 * - createdAt: Timestamp when created
 * - updatedAt: Timestamp when last updated
 */
export const courseLectureTexts = pgTable(
  "course_lecture_texts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }),
    content: jsonb("content").$type<Record<string, unknown>[]>().notNull().default([]),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("course_lecture_texts_creator_idx").on(table.createdByUserId),
    index("course_lecture_texts_created_at_idx").on(table.createdAt),
  ]
);

export type SchemaLectureTextSelect = InferSelectModel<typeof courseLectureTexts>;
export type SchemaLectureTextInsert = InferInsertModel<typeof courseLectureTexts>;
