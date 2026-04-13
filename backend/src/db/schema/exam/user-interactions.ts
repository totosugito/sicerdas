import {
  pgTable,
  timestamp,
  jsonb,
  uuid,
  numeric,
  integer,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { users } from "../user/users.ts";
import { examPackages } from "./packages.ts";

/**
 * User Exam Package Interactions
 *
 * The `examPackageInteractions` table tracks individual user interactions with exam packages.
 * It stores per-user interactions such as likes, ratings, bookmarks, and view counts.
 *
 * Fields:
 * - id: A unique UUID identifier for each interaction record.
 * - userId: References the user who performed the interaction.
 * - packageId: References the exam package that was interacted with.
 * - liked: Boolean indicating if the user liked the package.
 * - disliked: Boolean indicating if the user disliked the package.
 * - rating: User's rating of the package (0.00 to 5.00).
 * - bookmarked: Boolean indicating if the user bookmarked the package.
 * - viewCount: Number of times user viewed this package.
 * - extra: Flexible data storage for additional session details.
 * - createdAt: Timestamp of when the interaction record was created.
 * - updatedAt: Timestamp of when the interaction record was last updated.
 */
export const examPackageInteractions = pgTable(
  "exam_package_interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    packageId: uuid("package_id")
      .references(() => examPackages.id, { onDelete: "cascade" })
      .notNull(),

    // Individual user interactions
    liked: boolean("liked").default(false),
    disliked: boolean("disliked").default(false),
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0.00"),
    bookmarked: boolean("bookmarked").default(false),
    viewCount: integer("view_count").default(0),

    // Flexible data storage
    extra: jsonb("extra").$type<Record<string, unknown>>().default({}),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("exam_package_interactions_user_pkg_unique_idx").on(table.userId, table.packageId),
    index("exam_package_interactions_pkg_id_idx").on(table.packageId),
  ],
);

export type SchemaExamPackageInteractionInsert = InferInsertModel<typeof examPackageInteractions>;
export type SchemaExamPackageInteractionSelect = InferSelectModel<typeof examPackageInteractions>;
