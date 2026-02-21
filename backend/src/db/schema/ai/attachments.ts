import { pgTable, varchar, timestamp, text, uuid, integer, jsonb, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { aiMessages } from './messages.ts';

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
export const aiAttachments = pgTable('ai_attachments', {
    id: uuid().primaryKey().notNull().defaultRandom(),

    // Reference to the message
    messageId: uuid('message_id')
        .notNull()
        .references(() => aiMessages.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

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
    index('ai_attachments_message_id_idx').on(table.messageId),
]);

export type SchemaAiAttachmentSelect = InferSelectModel<typeof aiAttachments>;
export type SchemaAiAttachmentInsert = InferInsertModel<typeof aiAttachments>;
