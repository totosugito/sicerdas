import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid, varchar, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from './auth-schema.ts';
import { EnumUserTier, PgEnumUserTier } from './enum-app.ts';

/**
 * Table: ai_chat_sessions
 * 
 * This table stores chat sessions created by users for AI interactions.
 * Each session represents a distinct conversation thread with the AI.
 * 
 * Fields:
 * - id: Unique identifier for the chat session
 * - userId: ID of the user who created the session
 * - title: Descriptive name for the chat session
 * - modelId: Reference to the AI model used for this session (optional)
 * - extra: Flexible data storage for additional session details (optional)
 * - createdAt: When the session was created
 * - updatedAt: When the session was last updated (e.g., title change, activation status)
 *   Note: Automatically updated when new messages are added to the session
 * - isActive: Whether the session is currently active or archived
 */
export const aiChatSessions = pgTable('ai_chat_sessions', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  
  // User who created the session
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  // Session details
  title: varchar('title', { length: 255 }).notNull(),
  
  // Reference to the model used for this session (optional)
  modelId: uuid('model_id')
    .references(() => aiChatModels.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  
  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Session status
  isActive: boolean('is_active').notNull().default(true),
});

export type SchemaAiChatSessionSelect = InferSelectModel<typeof aiChatSessions>;
export type SchemaAiChatSessionInsert = InferInsertModel<typeof aiChatSessions>;

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
 * 
 * Design Notes:
 * - Messages are typically immutable after creation, so there's no updatedAt field.
 * - The position field is intentionally included despite having createdAt:
 *   1. Ensures precise ordering regardless of timestamp precision issues
 *   2. Simplifies queries for retrieving conversation history in order
 *   3. Allows for future features like message reordering or insertion
 * - The position field is zero-indexed and incremented for each new message in a session.
 * - When a message is created, it automatically updates the parent session's updatedAt field.
 */
export const aiChatMessages = pgTable('ai_chat_messages', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  
  // Reference to the chat session
  sessionId: uuid('session_id')
    .notNull()
    .references(() => aiChatSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  // AI model used for this message (optional, can be null for older messages)
  modelId: uuid('model_id')
    .references(() => aiChatModels.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  
  // Message details
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  
  // Timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Conversation ordering
  position: integer('position').notNull(), // Position of message in the conversation (zero-indexed)
  
  // Analytics/Billing
  tokens: integer('tokens'), // Number of tokens in the message (optional)
});

export type SchemaAiChatMessageSelect = InferSelectModel<typeof aiChatMessages>;
export type SchemaAiChatMessageInsert = InferInsertModel<typeof aiChatMessages>;

/**
 * Table: ai_chat_attachments
 * 
 * This table stores metadata for file attachments associated with chat messages.
 * Each attachment represents a file (image, document, etc.) uploaded by the user.
 * 
 * Fields:
 * - id: Unique identifier for the attachment
 * - messageId: ID of the message this attachment belongs to
 * - fileName: Original name of the uploaded file
 * - fileSize: Size of the file in bytes
 * - mimeType: MIME type of the file (e.g., 'image/png', 'application/pdf')
 * - extra: Flexible data storage for additional metadata (optional)
 * - createdAt: When the attachment was created
 * - url: Public URL to access the file (optional, for direct access)
 * 
 * Design Notes:
 * - Separating attachments into their own table allows for messages with multiple files
 * - Storing metadata separately from the message content keeps the messages table clean
 * - Files are stored using a structured path: userId/ai/sessionId/filename
 * - This eliminates the need for individual storage paths in the database
 * - The url field provides direct access to files when using CDNs or public storage
 */
export const aiChatAttachments = pgTable('ai_chat_attachments', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  
  // Reference to the message
  messageId: uuid('message_id')
    .notNull()
    .references(() => aiChatMessages.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  // File metadata
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(), // Size in bytes
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  
  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),
    
  // Timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Optional direct access URL
  url: text('url'), // Public URL to access the file
});

export type SchemaAiChatAttachmentSelect = InferSelectModel<typeof aiChatAttachments>;
export type SchemaAiChatAttachmentInsert = InferInsertModel<typeof aiChatAttachments>;

/**
 * Table: ai_chat_shares
 * 
 * This table stores information about shared AI chat sessions.
 * It enables read-only access to chat sessions for users who have the share link.
 * 
 * Fields:
 * - id: Unique identifier for the share record
 * - sessionId: ID of the chat session being shared
 * - shareToken: Unique token used to access the shared session (part of the share URL)
 * - createdBy: ID of the user who created the share
 * - extra: JSONB field for storing additional structured data without requiring schema changes with default empty object
 * - expiresAt: Optional expiration date for the share link
 * - createdAt: When the share was created
 * - isActive: Whether the share link is active or disabled
 */
export const aiChatShares = pgTable('ai_chat_shares', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  
  // Reference to the chat session being shared
  sessionId: uuid('session_id')
    .notNull()
    .references(() => aiChatSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  // Unique token for accessing the shared session
  shareToken: varchar('share_token', { length: 255 }).notNull().unique(),
  
  // User who created the share
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),

  // Optional expiration for the share link
  expiresAt: timestamp('expires_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Share status
  isActive: boolean('is_active').notNull().default(true),
});

export type SchemaAiChatShareSelect = InferSelectModel<typeof aiChatShares>;
export type SchemaAiChatShareInsert = InferInsertModel<typeof aiChatShares>;

/**
 * Table: ai_chat_models
 * 
 * This table stores available AI chat models that users can select from.
 * Each model has configuration details and can be enabled/disabled.
 * 
 * Fields:
 * - id: Unique identifier for the AI model
 * - name: Display name of the model (e.g., 'GPT-4', 'Claude-3')
 * - provider: Name of the AI provider (e.g., 'OpenAI', 'Anthropic', 'Google')
 * - modelIdentifier: The actual model identifier used in API calls
 * - description: Brief description of the model's capabilities
 * - maxTokens: Maximum tokens the model can handle
 * - extra: Flexible data storage for additional model-specific configuration
 * - isDefault: Whether this is the default model for new sessions
 * - isEnabled: Whether the model is currently available for use
 * - createdAt: When the model was added to the system
 * - updatedAt: When the model was last updated
 */
export const aiChatModels = pgTable('ai_chat_models', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  
  // Model details
  name: varchar('name', { length: 100 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  modelIdentifier: varchar('model_identifier', { length: 100 }).notNull().unique(),
  description: text('description'),
  maxTokens: integer('max_tokens'),
  
  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),
  
  // Model status
  isDefault: boolean('is_default').notNull().default(false),
  isEnabled: boolean('is_enabled').notNull().default(true),
  
  // Pricing tier
  status: PgEnumUserTier('status').notNull().default(EnumUserTier.FREE),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SchemaAiChatModelSelect = InferSelectModel<typeof aiChatModels>;
export type SchemaAiChatModelInsert = InferInsertModel<typeof aiChatModels>;