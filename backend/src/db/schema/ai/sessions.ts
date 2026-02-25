import { pgTable, varchar, timestamp, text, uuid, integer, boolean, jsonb, decimal, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../user/users.ts';
import { aiFolders } from './folders.ts';
import { aiModels } from './models.ts';

/**
 * Table: ai_sessions
 * 
 * This table stores chat sessions created by users for AI interactions.
 * Each session represents a distinct conversation thread with the AI.
 * 
 * Fields:
 * - id: Unique identifier for the chat session
 * - userId: ID of the user who created the session
 * - folderId: Optional folder for organization
 * - title: Descriptive name for the chat session
 * - modelId: Reference to the AI model used for this session (optional)
 * - isPinned: Whether the session is pinned to top
 * - systemInstruction: Custom system prompt for this session
 * - temperature: Model temperature setting (0-1)
 * - topP: Model topP setting (0-1)
 * - contextCount: Number of previous messages to include in context
 * - extra: Flexible data storage for additional session details (optional)
 * - createdAt: When the session was created
 * - updatedAt: When the session was last updated
 * - isActive: Whether the session is currently active or archived
 */
export const aiSessions = pgTable('ai_sessions', {
    id: uuid().primaryKey().notNull().defaultRandom(),

    // User who created the session
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    // Organization
    folderId: uuid('folder_id')
        .references(() => aiFolders.id, { onDelete: 'set null', onUpdate: 'cascade' }),

    isPinned: boolean('is_pinned').notNull().default(false),

    // Session details
    title: varchar('title', { length: 255 }).notNull(),

    // Reference to the model used for this session (optional)
    modelId: uuid('model_id')
        .references(() => aiModels.id, { onDelete: 'set null', onUpdate: 'cascade' }),

    // Session Settings
    systemInstruction: text('system_instruction'),
    temperature: decimal('temperature', { precision: 3, scale: 2 }), // e.g. 0.70
    topP: decimal('top_p', { precision: 3, scale: 2 }),
    contextCount: integer('context_count'),

    // Flexible data storage
    extra: jsonb("extra")
        .$type<Record<string, unknown>>()
        .default({}),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

    // Session status
    isActive: boolean('is_active').notNull().default(true),
}, (table) => [
    index('ai_sessions_user_id_idx').on(table.userId),
    index('ai_sessions_folder_id_idx').on(table.folderId),
    index('ai_sessions_created_at_idx').on(table.createdAt),
]);

export type SchemaAiSessionSelect = InferSelectModel<typeof aiSessions>;
export type SchemaAiSessionInsert = InferInsertModel<typeof aiSessions>;
