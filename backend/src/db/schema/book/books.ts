import { pgTable, varchar, timestamp, text, jsonb, uuid, integer, index } from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { EnumContentStatus, PgEnumContentStatus } from "../enum/enum-app.ts";
import { appVersion } from "../app/app-version.ts";
import { educationGrades } from "../education/education.ts";
import { bookGroup } from "./group.ts";

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
 *
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
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
    index('books_title_index').on(table.title),
    index('books_author_index').on(table.author),
    index('books_group_id_index').on(table.bookGroupId),
    index('books_grade_id_index').on(table.educationGradeId),
]);

export type SchemaBookInsert = InferInsertModel<typeof books>;
export type SchemaBookSelect = InferSelectModel<typeof books>;
