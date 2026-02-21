import { pgTable, varchar, timestamp, text, uuid, integer, boolean, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { aiSessions } from './sessions.ts';
import { aiModels } from './models.ts';

/**
 * Table: ai_chat_messages
 * 
 * This table stores individual messages within chat sessions.
 * Messages include both user prompts and AI responses.
 * 
 * Fields:
 * - id: Unique identifier for the message
 * - sessionId: ID of the chat session this message belongs to
 * - modelId: Reference to the AI model used for this message (optional)
 * - role: Whether the message is from 'user' or 'assistant' (AI)
 * - content: The text content of the message
 * - createdAt: When the message was created
 * - position: Order of the message in the conversation (0-indexed)
 * - tokens: Number of tokens in the message (optional, for analytics/billing)
 * - isEdited: Whether the message content has been edited
 * - rating: User rating (1=like, -1=dislike, 0=none)
 * - feedback: Text feedback from user
 */
export const aiMessages = pgTable('ai_messages', {
    id: uuid().primaryKey().notNull().defaultRandom(),

    // Reference to the chat session
    sessionId: uuid('session_id')
        .notNull()
        .references(() => aiSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

    // AI model used for this message (optional, can be null for older messages)
    modelId: uuid('model_id')
        .references(() => aiModels.id, { onDelete: 'set null', onUpdate: 'cascade' }),

    // Message details
    role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
    content: text('content').notNull(),

    // Timestamp
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // Request/Response timing for analytics
    requestStartedAt: timestamp('request_started_at'), // When AI request started
    responseReceivedAt: timestamp('response_received_at'), // When AI response received

    // Conversation ordering
    position: integer('position').notNull(), // Position of message in the conversation (zero-indexed)

    // Analytics/Billing
    tokens: integer('tokens'), // Number of tokens in the message (optional)

    // Status & Feedback
    isSuccess: boolean('is_success').notNull().default(true),
    isEdited: boolean('is_edited').notNull().default(false),
    rating: integer('rating').default(0), // 1: like, -1: dislike, 0: null
    feedback: text('feedback'),
}, (table) => [
    index('ai_messages_session_id_idx').on(table.sessionId),
    index('ai_messages_created_at_idx').on(table.createdAt),
    index('ai_messages_position_idx').on(table.position),
]);

export type SchemaAiMessageSelect = InferSelectModel<typeof aiMessages>;
export type SchemaAiMessageInsert = InferInsertModel<typeof aiMessages>;
