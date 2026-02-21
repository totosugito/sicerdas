
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import envConfig from "../../../config/env.config.ts";
import * as schema from '../../../db/schema/index.ts';
import { tierPricing } from '../../../db/schema/app/tier-pricing.ts';

/**
 * Initializes the default tier pricing plans (Free and Pro).
 * This script ensures that the base subscription tiers exist in the database.
 */
export default async function initTierPricing() {
    const pool = new pg.Pool({
        connectionString: envConfig.db.url,
        max: 10,
    });

    const db = drizzle(pool, { schema });

    console.log('Initializing Tier Pricing...');

    try {
        const tiers = [
            {
                name: 'Free',
                slug: 'free',
                price: '0.00',
                currency: 'USD',
                billingCycle: 'monthly',
                features: [
                    'Basic Chat Access',
                    'Limited Daily Messages',
                    'Standard Response Speed'
                ],
                limits: {
                    chatAi: {
                        daily_messages: 10,
                        max_tokens: 1000
                    }
                },
                isActive: true,
                isPopular: false,
                sortOrder: 1
            },
            {
                name: 'Pro',
                slug: 'pro',
                price: '9.99',
                currency: 'USD',
                billingCycle: 'monthly',
                features: [
                    'Priority Chat Access',
                    'Priority Response Speed',
                    'Access to Advanced Models',
                    'Image Generation'
                ],
                limits: {
                    chatAi: {
                        daily_messages: 100,
                        max_tokens: 4000
                    }
                },
                isActive: true,
                isPopular: true,
                sortOrder: 2
            },
            {
                name: 'Enterprise',
                slug: 'enterprise',
                price: '99.99',
                currency: 'USD',
                billingCycle: 'monthly',
                features: [
                    'Unlimited Chat Access',
                    'Priority Response Speed',
                    'Access to Advanced Models',
                    'Image Generation'
                ],
                limits: {
                    chatAi: {
                        daily_messages: -1,
                        max_tokens: 4000
                    }
                },
                isActive: true,
                isPopular: false,
                sortOrder: 3
            }
        ];

        for (const tier of tiers) {
            await db.insert(tierPricing)
                .values(tier as any)
                .onConflictDoUpdate({
                    target: tierPricing.slug,
                    set: {
                        name: tier.name,
                        price: tier.price,
                        currency: tier.currency,
                        billingCycle: tier.billingCycle,
                        features: tier.features,
                        limits: tier.limits,
                        isActive: tier.isActive,
                        sortOrder: tier.sortOrder,
                        isPopular: tier.isPopular,
                        updatedAt: new Date()
                    }
                });
            console.log(`✓ Tier '${tier.name}' initialized/updated.`);
        }

        console.log('✓ Tier Pricing initialization completed.');

    } catch (error) {
        console.error('❌ Error initializing Tier Pricing:', error);
        throw error;
    } finally {
        await pool.end();
    }
}
