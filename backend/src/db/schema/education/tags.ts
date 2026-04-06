import { pgTable, uuid, varchar, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { users } from "../user/index.ts";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

/**
 * Table: education_tags
 *
 * A dictionary/catalog of topics or tags used to classify educational content
 * for targeted learning (e.g., 'Algebra', 'HOTS', 'Syllogisms').
 */
export const educationTags = pgTable(
  "education_tags",
  {
    // Unique identifier for the tag
    id: uuid("id").primaryKey().defaultRandom(),

    // Unique name of the tag/topic
    name: varchar("name", { length: 100 }).unique().notNull(),

    // Optional description of the topic
    description: text("description"),

    // Control flag to softly hide tags without deleting them
    isActive: boolean("is_active").default(true).notNull(),

    // The user who created this category (for ownership tracking)
    createdByUserId: uuid("created_by_user_id").references(() => users.id),

    // Timestamp when this tag was created
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    // Timestamp when this tag was last updated
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    creatorIdx: index("education_tags_creator_idx").on(table.createdByUserId),
  }),
);

export type SchemaEducationTagSelect = InferSelectModel<typeof educationTags>;
export type SchemaEducationTagInsert = InferInsertModel<typeof educationTags>;
