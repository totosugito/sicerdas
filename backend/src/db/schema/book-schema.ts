import { pgTable, varchar, timestamp, integer, text, jsonb, serial, uuid, numeric, index, boolean } from 'drizzle-orm/pg-core';
import { educationGrades } from "./education-schema.ts";
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import {
  EnumContentStatus,
  PgEnumContentStatus,
} from "./enum-app.ts";
import { appVersion } from "./version-schema.ts";
import { userEventHistory } from './web-schema.ts';
import { users } from './auth-schema.ts';

export type SchemaBookCategoryInsert = InferInsertModel<typeof bookCategory>;
export type SchemaBookGroupInsert = InferInsertModel<typeof bookGroup>;
export type SchemaBookInsert = InferInsertModel<typeof books>;

/**
 * Book Category
 * 
 * The `bookCategory` table stores information about different categories of books.
 * Each category has a unique code and name, along with an optional description and extra metadata.
 * It also includes a status field to manage the publication state of the category,
 * and timestamps for tracking creation and update times.
 * 
 * Fields:
 * - id: A unique serial identifier for each category.
 * - versionId: A reference to the version of the application the category belongs to.
 * - code: A unique string identifier for the category (max 64 characters).
 * - name: The name of the category (max 128 characters).
 * - desc: An optional text description of the category.
 * - extra: A JSONB field for storing additional metadata.
 * - status: The publication status of the category (e.g., published, draft).
 * - createdAt: Timestamp of when the category was created.
 * - updatedAt: Timestamp of when the category was last updated.

 */
export const bookCategory = pgTable('book_category', {
  id: serial('id').primaryKey().notNull(),
  versionId: integer('version_id')
    .references(() => appVersion.id, { onDelete: 'set null' })
    .notNull(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  desc: text('desc')
    .default(''),
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),
  status: PgEnumContentStatus('status').notNull().default(EnumContentStatus.PUBLISHED),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Book Group
 * 
 * The `bookGroup` table organizes books into logical groups within a specific category.
 * Each group is associated with a version and a category, and contains metadata such as name and description.
 * It supports tracking the publication status and maintains timestamps for creation and updates.
 * 
 * Fields:
 * - id: A unique serial identifier for each book group.
 * - versionId: References the application version this group belongs to.
 * - categoryId: References the category that this group belongs under.
 * - name: The name of the book group (max 128 characters).
 * - shortName: The short name of the book group (max 64 characters).
 * - desc: An optional textual description of the group.
 * - extra: A JSONB field for additional unstructured data.
 * - status: Publication status of the group (e.g., published, draft).
 * - createdAt: Timestamp indicating when the group was created.
 * - updatedAt: Timestamp indicating when the group was last modified.

 */
export const bookGroup = pgTable('book_group', {
  id: serial('id').primaryKey().notNull(),
  versionId: integer('version_id')
    .references(() => appVersion.id, { onDelete: 'set null' })
    .notNull(),
  categoryId: integer('category_id')
    .references(() => bookCategory.id, { onDelete: 'set null' })
    .notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  shortName: varchar('short_name', { length: 128 }).notNull(),
  desc: text('desc')
    .default(''),
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),
  status: PgEnumContentStatus('status').notNull().default(EnumContentStatus.PUBLISHED),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


/**
 * Books
 * 
 * The `books` table stores detailed information about individual books.
 * Each book is associated with a version, a book group, and an education grade.
 * It includes metadata such as title, description, author, publication year, and more.
 * The table also tracks the book's status and maintains timestamps for creation and updates.
 * 
 * Fields:
 * - id: A unique UUID identifier for each book.
 * - bookId: A unique integer identifier for the book, originally from JSON data.
 * - versionId: References the application version this book belongs to.
 * - bookGroupId: References the group that this book belongs under.
 * - educationGradeId: References the education grade associated with this book.
 * - title: The title of the book.
 * - description: An optional textual description of the book.
 * - author: The author of the book.
 * - publishedYear: The year the book was published (stored as a string, max 32 characters).
 * - totalPages: The total number of pages in the book.
 * - size: The size of the book (possibly in bytes or another unit).
 * - status: The publication status of the book (e.g., published, draft).
 * - extra: A JSONB field for storing additional metadata.
 * - createdAt: Timestamp of when the book was created.
 * - updatedAt: Timestamp of when the book was last updated.

*/
export const books = pgTable('books', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookId: integer('book_id').notNull().unique(), // Original BookId from JSON, unique identifier
  versionId: integer('version_id')
    .references(() => appVersion.id, { onDelete: 'set null' })
    .notNull(),
  bookGroupId: integer('book_group_id')
    .references(() => bookGroup.id, { onDelete: 'set null' })
    .notNull(),
  educationGradeId: integer('education_grade_id')
    .references(() => educationGrades.id, { onDelete: 'set null' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  author: text('author').notNull(),
  publishedYear: varchar('published_year', { length: 32 }).notNull(),
  totalPages: integer('total_pages').notNull(),
  size: integer('size').notNull(),
  status: PgEnumContentStatus('status').notNull().default(EnumContentStatus.PUBLISHED),
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('books_title_index').on(table.title),
  index('books_author_index').on(table.author),
  index('books_group_id_index').on(table.bookGroupId),
  index('books_grade_id_index').on(table.educationGradeId),
]);

/**
 * Book Group Statistics
 * 
 * The `bookGroupStats` table maintains statistical information about book groups.
 * It tracks the total number of books within each group, providing insights into
 * the size and activity of different sections in the library.
 * 
 * Fields:
 * - id: A unique serial identifier for each statistics record.
 * - bookGroupId: References the book group that these statistics belong to.
 * - bookTotal: The total count of books in the associated book group.
 * - extra: Additional information or metadata related to the book group statistics.
 * - createdAt: Timestamp of when the statistics record was created.
 * - updatedAt: Timestamp of when the statistics record was last updated.
 */
export const bookGroupStats = pgTable('book_group_stats', {
  id: serial('id').primaryKey().notNull(),
  bookGroupId: integer('book_group_id')
    .references(() => bookGroup.id, { onDelete: 'set null' })
    .notNull(),
  bookTotal: integer('book_total').default(0),

  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('book_group_stats_book_group_id_index').on(table.bookGroupId),
]);

/**
 * Book Event Stats
 * 
 * The `bookEventStats` table tracks various user interaction events for each book.
 * It maintains counters for views, downloads, reads, likes, dislikes, shares, and bookmarks,
 * as well as an average rating for the book. This data is crucial for understanding
 * user engagement and content popularity.
 * 
 * Fields:
 * - id: A unique UUID identifier for each event stats record.
 * - userEventHistory: A reference to the user event history that these stats belong to (UUID).
 * - bookId: A reference to the book that these stats belong to (UUID).
 * - viewCount: Number of times the book has been viewed.
 * - downloadCount: Number of times the book has been downloaded.
 * - readCount: Number of times the book has been read.
 * - likeCount: Number of likes received for the book.
 * - dislikeCount: Number of dislikes received for the book.
 * - shareCount: Number of times the book has been shared.
 * - bookmarkCount: Number of times the book has been bookmarked.
 * - rating: Average rating of the book, stored as a decimal value (0.00 to 5.00).
 * - extra: Additional information about the book, such as its popularity, quality, etc.
 * - createdAt: Timestamp of when the stats record was created.
 * - updatedAt: Timestamp of when the stats record was last updated.
 */
export const bookEventStats = pgTable('book_event_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userEventHistory: uuid('user_event_history_id')
    .references(() => userEventHistory.id, { onDelete: 'cascade' })
    .notNull(),
  bookId: uuid('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(), // Changed to UUID to match books.id

  // Event counters for each type
  viewCount: integer('view_count').notNull().default(0),
  downloadCount: integer('download_count').notNull().default(0),
  readCount: integer('read_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  dislikeCount: integer('dislike_count').notNull().default(0),
  shareCount: integer('share_count').notNull().default(0),
  bookmarkCount: integer('bookmark_count').notNull().default(0),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0.00'), // Rating as decimal (0.00 to 5.00)

  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('book_event_stats_book_id_index').on(table.bookId),
  index('book_event_stats_user_event_history_index').on(table.userEventHistory),
]);

/**
 * User Book Interactions
 * 
 * The `userBookInteractions` table tracks individual user interactions with books.
 * Unlike bookEventStats which tracks global statistics, this table stores per-user
 * interactions allowing us to know if a specific user has liked, rated, or bookmarked
 * a book. This enables personalized experiences and prevents duplicate actions.
 * 
 * Fields:
 * - id: A unique UUID identifier for each interaction record.
 * - userId: References the user who performed the interaction.
 * - bookId: References the book that was interacted with.
 * - liked: Boolean indicating if the user liked the book.
 * - disliked: Boolean indicating if the user disliked the book.
 * - rating: User's rating of the book (0.00 to 5.00).
 * - bookmarked: Boolean indicating if the user bookmarked the book.
 * - extra: Flexible data storage for additional session details (optional)
 * - createdAt: Timestamp of when the interaction record was created.
 * - updatedAt: Timestamp of when the interaction record was last updated.
 */
export const userBookInteractions = pgTable('user_book_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  bookId: uuid('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),

  // Individual user interactions
  liked: boolean('liked').default(false),
  disliked: boolean('disliked').default(false),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0.00'), // User's rating (0.00 to 5.00)
  bookmarked: boolean('bookmarked').default(false),

  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Ensure a user can only have one interaction record per book
  index('user_book_interactions_user_book_index').on(table.userId, table.bookId),
]);

export type SchemaUserBookInteractionInsert = InferInsertModel<typeof userBookInteractions>;
export type SchemaUserBookInteractionSelect = InferSelectModel<typeof userBookInteractions>;
