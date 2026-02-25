import { pgTable, varchar, timestamp, uuid, integer, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';

/**
 * Table: ai_chat_folders
 * 
 * This table stores folders for organizing chat sessions.
 */
export const aiFolders = pgTable('ai_folders', {
    id: uuid().primaryKey().notNull().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    color: varchar('color', { length: 50 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('ai_folders_user_idx').on(table.userId),
]);

export type SchemaAiFolderSelect = InferSelectModel<typeof aiFolders>;
export type SchemaAiFolderInsert = InferInsertModel<typeof aiFolders>;
