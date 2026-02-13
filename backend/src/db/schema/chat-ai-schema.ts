import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid, varchar, integer, jsonb, index, decimal } from 'drizzle-orm/pg-core';
import { users } from './auth-schema.ts';
import { tierPricing } from './tier-pricing.ts';
import { EnumUsageType, PgEnumUsageType } from './enum-app.ts';

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

/**
 * Table: ai_chat_sessions
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
export const aiChatSessions = pgTable('ai_chat_sessions', {
  id: uuid().primaryKey().notNull().defaultRandom(),

  // User who created the session
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

  // Organization
  folderId: uuid('folder_id')
    .references(() => aiChatFolders.id, { onDelete: 'set null', onUpdate: 'cascade' }),

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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Session status
  isActive: boolean('is_active').notNull().default(true),
}, (table) => [
  index('ai_chat_sessions_user_id_idx').on(table.userId),
  index('ai_chat_sessions_folder_id_idx').on(table.folderId),
  index('ai_chat_sessions_created_at_idx').on(table.createdAt),
]);

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
 * - isEdited: Whether the message content has been edited
 * - rating: User rating (1=like, -1=dislike, 0=none)
 * - feedback: Text feedback from user
 */
export const aiChatMessages = pgTable('ai_chat_messages', {
  id: uuid().primaryKey().notNull().defaultRandom(),

  // Reference to the chat session
  sessionId: uuid('session_id')
    .notNull()
    .references(() => aiChatSessions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

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
  index('ai_chat_messages_session_id_idx').on(table.sessionId),
  index('ai_chat_messages_created_at_idx').on(table.createdAt),
  index('ai_chat_messages_position_idx').on(table.position),
]);

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
}, (table) => [
  index('ai_chat_attachments_message_id_idx').on(table.messageId),
]);

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
}, (table) => [
  index('ai_chat_shares_session_id_idx').on(table.sessionId),
]);

export type SchemaAiChatShareSelect = InferSelectModel<typeof aiChatShares>;
export type SchemaAiChatShareInsert = InferInsertModel<typeof aiChatShares>;

/**
 * Table: ai_models
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
 * - supportsImage: Whether the model supports image input
 * - supportsFile: Whether the model supports file input
 * - acceptedImageExtensions: List of supported image extensions (e.g. ['.jpg', '.png'])
 * - acceptedFileExtensions: List of supported file extensions (e.g. ['.pdf', '.txt'])
 * - maxFileSize: Maximum file size allowed for uploads (in bytes)
 * - extra: Flexible data storage for additional model-specific configuration
 * - tierCapabilities: Tier-specific capabilities (overrides base settings)
 * - isDefault: Whether this is the default model for new sessions
 * - isEnabled: Whether the model is currently available for use
 * - createdAt: When the model was added to the system
 * - updatedAt: When the model was last updated
 */
export const aiModels = pgTable('ai_chat_models', {
  id: uuid().primaryKey().notNull().defaultRandom(),

  // Model details
  name: varchar('name', { length: 100 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  modelIdentifier: varchar('model_identifier', { length: 100 }).notNull().unique(),
  apiKey: text('api_key'), // Encrypted API Key for the model provider
  description: text('description'),
  maxTokens: integer('max_tokens'),

  supportsImage: boolean('supports_image').notNull().default(false),
  supportsFile: boolean('supports_file').notNull().default(false),

  acceptedImageExtensions: jsonb('accepted_image_extensions').$type<string[]>().default(['.jpg', '.jpeg', '.png', '.webp']),
  acceptedFileExtensions: jsonb('accepted_file_extensions').$type<string[]>().default(['.pdf', '.txt', '.csv', '.docx']),

  maxFileSize: integer('max_file_size'),

  // Tier-specific capabilities (overrides base settings)
  // These values override the base columns (supportsImage, maxFileSize, etc.) for specific user tiers.
  // If a key is missing here, the base column value is used.
  // Key: tier_pricing.slug (e.g., "free", "pro")
  // Structure: { "free": { "maxFileSize": 100 }, "pro": { "supportsImage": true } }
  tierCapabilities: jsonb("tier_capabilities")
    .$type<Record<string, {
      supportsImage?: boolean;
      supportsFile?: boolean;
      maxFileSize?: number;
      maxTokens?: number;
    }>>()
    .default({}),

  // Flexible data storage
  extra: jsonb("extra")
    .$type<Record<string, unknown>>()
    .default({}),

  // Model status
  isDefault: boolean('is_default').notNull().default(false),
  isEnabled: boolean('is_enabled').notNull().default(true),

  // Pricing tier
  requiredTierId: uuid('required_tier_id')
    .references(() => tierPricing.id, { onDelete: 'set null', onUpdate: 'cascade' }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SchemaAiModelSelect = InferSelectModel<typeof aiModels>;
export type SchemaAiModelInsert = InferInsertModel<typeof aiModels>;

/**
 * Table: user_ai_usage
 * 
 * This table tracks the AI usage of a user for a specific billing period or cycle.
 * It is used to enforce tier limits (e.g., max tokens per month).
 * 
 * Fields:
 * - id: Unique identifier
 * - userId: The user
 * - tierId: The tier the user was on during this usage period (snapshot for audit)
 * - type: The type of usage record (daily or monthly)
 * - periodStart: Start of the usage period
 * - periodEnd: End of the usage period
 * - tokensUsed: Total tokens used in this period
 * - requestCount: Total number of requests made
 * - extra: JSONB for breakdown by model or other stats if needed
 */
export const userAiUsage = pgTable('user_ai_usage', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

  tierId: uuid('tier_id')
    .references(() => tierPricing.id, { onDelete: 'set null', onUpdate: 'cascade' }),

  type: PgEnumUsageType('type').notNull().default(EnumUsageType.MONTHLY),

  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),

  tokensUsed: integer('tokens_used').notNull().default(0),
  requestCount: integer('request_count').notNull().default(0),

  // Potential for detailed breakdown, e.g. { "gpt-4": 100, "claude-3": 200 }
  extra: jsonb('extra').$type<Record<string, any>>().default({}),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('user_ai_usage_user_period_idx').on(table.userId, table.periodStart, table.periodEnd),
  index('user_ai_usage_type_idx').on(table.type),
]);

export type SchemaUserAiUsageSelect = InferSelectModel<typeof userAiUsage>;
export type SchemaUserAiUsageInsert = InferInsertModel<typeof userAiUsage>;

/**
 * Table: ai_api_logs
 * 
 * This table stores aggregated AI API statistics per hour for analytics and monitoring.
 * 
 * **Purpose:**
 * - Track model performance over time (success rates, response times, token usage)
 * - Enable historical analysis and trend detection
 * - Support billing and cost tracking via token counts
 * - Monitor system health and identify problematic models
 * 
 * **Data Population:**
 * - Populated by hourly scheduled job (cron/scheduler)
 * - Aggregates data from `aiChatMessages` table
 * - Each record represents one hour of activity for one model
 * 
 * **Performance Benefits:**
 * - Reduces database load by avoiding real-time statistics calculation
 * - Pre-aggregated data enables fast dashboard queries
 * - Scales to millions of messages without performance degradation
 * 
 * **Fields:**
 * - id: Unique identifier for this aggregation record
 * - modelId: Reference to the AI model (required, cascades on delete)
 * - periodStart: Start of the hourly period (e.g., 2024-01-01 14:00:00)
 * - periodEnd: End of the hourly period (e.g., 2024-01-01 15:00:00)
 * - successCount: Number of successful API calls in this period
 * - failureCount: Number of failed API calls in this period
 * - totalRequests: Total requests (successCount + failureCount)
 * - avgDuration: Average response time in milliseconds for this period
 * - totalTokens: Total tokens consumed in this period (for billing)
 * - createdAt: When this aggregation record was created
 * 
 * **Indexes:**
 * - modelId: Fast lookups by model
 * - periodStart, periodEnd: Time-range queries
 * - (modelId, periodStart): Composite index for efficient model+time filtering
 * 
 * **Example Query:**
 * ```sql
 * -- Get last 24 hours of stats for a specific model
 * SELECT * FROM ai_api_logs 
 * WHERE model_id = 'xxx' 
 *   AND period_start >= NOW() - INTERVAL '24 hours'
 * ORDER BY period_start DESC;
 * ```
 */
export const aiApiLogs = pgTable('ai_api_logs', {
  id: uuid().primaryKey().notNull().defaultRandom(),

  // Reference to the model used
  modelId: uuid('model_id')
    .notNull()
    .references(() => aiModels.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

  // Aggregation period
  periodStart: timestamp('period_start').notNull(), // Start of hour (e.g., 2024-01-01 14:00:00)
  periodEnd: timestamp('period_end').notNull(),     // End of hour (e.g., 2024-01-01 15:00:00)

  // Aggregated metrics
  successCount: integer('success_count').notNull().default(0),
  failureCount: integer('failure_count').notNull().default(0),
  totalRequests: integer('total_requests').notNull().default(0), // successCount + failureCount

  avgDuration: integer('avg_duration'), // Average duration in milliseconds
  totalTokens: integer('total_tokens'), // Total tokens used in this period

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('ai_api_logs_model_id_idx').on(table.modelId),
  index('ai_api_logs_period_start_idx').on(table.periodStart),
  index('ai_api_logs_period_end_idx').on(table.periodEnd),
  // Composite index for efficient queries by model and time range
  index('ai_api_logs_model_period_idx').on(table.modelId, table.periodStart),
]);

export type SchemaAiApiLogSelect = InferSelectModel<typeof aiApiLogs>;
export type SchemaAiApiLogInsert = InferInsertModel<typeof aiApiLogs>;