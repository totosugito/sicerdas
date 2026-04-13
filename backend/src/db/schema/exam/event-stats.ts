import { pgTable, timestamp, jsonb, uuid, numeric, integer } from "drizzle-orm/pg-core";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { examPackages } from "./packages.ts";

/**
 * Exam Package Event Stats
 *
 * The `examPackageEventStats` table tracks various user interaction events for each exam package.
 * It maintains counters for views, likes, dislikes, shares, and bookmarks, as well as an average rating.
 *
 * Fields:
 * - id: A unique UUID identifier for each event stats record.
 * - packageId: A reference to the exam package that these stats belong to (UUID).
 * - viewCount: Number of times the package has been viewed.
 * - likeCount: Number of likes received for the package.
 * - dislikeCount: Number of dislikes received for the package.
 * - shareCount: Number of times the package has been shared.
 * - bookmarkCount: Number of times the package has been bookmarked.
 * - ratingCount: Number of ratings received.
 * - ratingSum: Sum of all ratings received.
 * - rating: Average rating of the package (0.00 to 5.00).
 * - extra: Additional metadata related to the package statistics.
 * - createdAt: Timestamp of when the stats record was created.
 * - updatedAt: Timestamp of when the stats record was last updated.
 */
export const examPackageEventStats = pgTable("exam_package_event_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  packageId: uuid("package_id")
    .references(() => examPackages.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  // Event counters
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  dislikeCount: integer("dislike_count").notNull().default(0),
  shareCount: integer("share_count").notNull().default(0),
  bookmarkCount: integer("bookmark_count").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  ratingSum: numeric("rating_sum", { precision: 10, scale: 2 }).notNull().default("0.00"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0.00"),

  // Flexible data storage
  extra: jsonb("extra").$type<Record<string, unknown>>().default({}),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SchemaExamPackageEventStatInsert = InferInsertModel<typeof examPackageEventStats>;
export type SchemaExamPackageEventStatSelect = InferSelectModel<typeof examPackageEventStats>;
