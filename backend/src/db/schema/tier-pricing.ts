import { boolean, integer, jsonb, pgTable, timestamp, uuid, varchar, decimal } from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Table: tier_pricing
 * 
 * This table defines the subscription tiers available in the application.
 * It replaces the hardcoded EnumUserTier to allow for dynamic plan management.
 * 
 * Fields:
 * - id: Unique identifier
 * - name: Display name (e.g., "Free", "Pro", "Enterprise")
 * - slug: Unique machine-readable identifier (e.g., "free", "pro") - used for code checks
 * - price: Cost of the tier
 * - currency: Currency code (e.g., "USD", "IDR")
 * - billingCycle: Frequency of billing (monthly, yearly, one_time)
 * - features: JSON array of strings listing features for UI display
 * - limits: JSON object defining specific limits (tokens, storage, etc.)
 * - isActive: Whether the plan is currently available
 * - sortOrder: Integer for controlling display order in UI
 */
export const tierPricing = pgTable('tier_pricing', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),

    // Display and Identity
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),

    // Pricing
    price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0'),
    currency: varchar('currency', { length: 10 }).notNull().default('USD'),
    billingCycle: varchar('billing_cycle', { length: 20 }).notNull().default('monthly'), // monthly, yearly, one_time

    // Capabilities
    features: jsonb('features').$type<string[]>().default([]),
    limits: jsonb('limits').$type<Record<string, any>>().default({}),

    // Status and Ordering
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SchemaTierPricingSelect = InferSelectModel<typeof tierPricing>;
export type SchemaTierPricingInsert = InferInsertModel<typeof tierPricing>;
