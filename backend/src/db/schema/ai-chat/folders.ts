import { pgTable, varchar, timestamp, uuid, integer, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../auth-schema.ts';

/**
 * Table: ai_chat_folders
 * 
 * This table stores folders for organizing chat sessions.
 */
export const aiChatFolders = pgTable('ai_chat_folders', {
    id: uuid().primaryKey().notNull().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    color: varchar('color', { length: 50 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('ai_chat_folders_user_idx').on(table.userId),
]);

export type SchemaAiChatFolderSelect = InferSelectModel<typeof aiChatFolders>;
export type SchemaAiChatFolderInsert = InferInsertModel<typeof aiChatFolders>;
