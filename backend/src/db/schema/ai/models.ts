import { pgTable, varchar, timestamp, text, uuid, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { appTier } from '../app/app-tier.ts';

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
export const aiModels = pgTable('ai_models', {
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
    requiredTierId: varchar('required_tier_id', { length: 50 })
        .references(() => appTier.slug, { onDelete: 'set null', onUpdate: 'cascade' }),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SchemaAiModelSelect = InferSelectModel<typeof aiModels>;
export type SchemaAiModelInsert = InferInsertModel<typeof aiModels>;
