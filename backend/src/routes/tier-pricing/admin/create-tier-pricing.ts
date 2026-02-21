import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { tierPricing } from '../../../db/schema/app/app-tier.ts';
import { db } from '../../../db/db-pool.ts';
import { eq, or, count } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const CreateTierBody = Type.Object({
    slug: Type.String({ minLength: 1 }),
    name: Type.String({ minLength: 1 }),
    price: Type.String(), // Decimal as string to avoid precision loss
    currency: Type.String({ default: 'USD' }),
    billingCycle: Type.String({ default: 'monthly' }),
    features: Type.Array(Type.String(), { default: [] }),
    limits: Type.Record(Type.String(), Type.Unknown(), { default: {} }),
    isActive: Type.Boolean({ default: true }),
    sortOrder: Type.Number({ default: -1 }),
    isPopular: Type.Boolean({ default: false }),
});

const TierResponseItem = Type.Object({
    slug: Type.String(),
    name: Type.String(),
    price: Type.String(),
    currency: Type.String(),
    billingCycle: Type.String(),
    features: Type.Array(Type.String()),
    limits: Type.Record(Type.String(), Type.Unknown()),
    isActive: Type.Boolean(),
    sortOrder: Type.Number(),
    isPopular: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const CreateTierResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: TierResponseItem,
});

const createTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create-tier',
        method: 'POST',
        schema: {
            tags: ['Tier Pricing'],
            body: CreateTierBody,
            response: {
                200: CreateTierResponse,
                '4xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                }),
                '5xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                })
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof CreateTierBody.static }>,
            reply: FastifyReply
        ): Promise<typeof CreateTierResponse.static> {
            const { slug, name } = request.body;

            const existingTier = await db.query.tierPricing.findFirst({
                where: or(
                    eq(tierPricing.slug, slug),
                    eq(tierPricing.name, name)
                )
            });

            if (existingTier) {
                return reply.badRequest(request.i18n.t('tierPricing.create.exists'));
            }

            // If sortOrder is not defined or is -1, set it to the total count of existing tiers
            let sortOrder = request.body.sortOrder;
            if (sortOrder === undefined || sortOrder === -1) {
                const [result] = await db.select({ count: count() }).from(tierPricing);
                sortOrder = result.count + 1;
            }

            const [newTier] = await db.insert(tierPricing).values({
                ...request.body,
                sortOrder,
                features: request.body.features || [],
                limits: request.body.limits || {},
            }).returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('tierPricing.create.success'),
                data: {
                    ...newTier,
                    features: newTier.features || [],
                    limits: newTier.limits || {},
                    createdAt: newTier.createdAt.toISOString(),
                    updatedAt: newTier.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default createTierPricingRoute;
