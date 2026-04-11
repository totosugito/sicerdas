import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  boolean,
  index,
  integer,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { examSubjects } from "./subjects.ts";
import { users } from "../user/users.ts";

/**
 * Table: exam_passages
 *
 * Stores long reading passages, graphs, or context blocks that apply to
 * multiple questions simultaneously (e.g., reading comprehension passages).
 */
export const examPassages = pgTable(
  "exam_passages",
  {
    // Unique identifier for the passage
    id: uuid("id").primaryKey().defaultRandom(),

    // Internal title or reference name for the passage (e.g., 'Reading 1: Economics')
    title: varchar("title", { length: 255 }),

    // Mandatory link to a subject (e.g., this passage is for Bahasa Indonesia)
    subjectId: uuid("subject_id")
      .references(() => examSubjects.id, { onDelete: "restrict" })
      .notNull(),

    // Rich text content of the passage stored in BlockNote JSON format
    content: jsonb("content").$type<Record<string, unknown>[]>().notNull(),

    // Tracks the user who created this passage
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Control flag to softly hide passages without deleting them
    isActive: boolean("is_active").default(true).notNull(),

    // Active/Total counters for questions (Denormalization for scale)
    totalQuestions: integer("total_questions").default(0).notNull(),
    activeQuestions: integer("active_questions").default(0).notNull(),

    // Timestamp when this passage was created
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this passage was last updated
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("exam_passages_subject_id_idx").on(table.subjectId),
    index("exam_passages_creator_idx").on(table.createdByUserId),
    index("idx_passage_total_questions").on(table.totalQuestions),
    index("idx_passage_active_questions").on(table.activeQuestions),
  ],
);

export type SchemaExamPassageSelect = InferSelectModel<typeof examPassages>;
export type SchemaExamPassageInsert = InferInsertModel<typeof examPassages>;
