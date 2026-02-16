import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { tierPricing } from '../../../db/schema/tier-pricing.ts';
import { db } from '../../../db/index.ts';
import { eq, ne, and, or } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const UpdateTierParams = Type.Object({
    slug: Type.String(),
});

const UpdateTierBody = Type.Object({
    slug: Type.Optional(Type.String({ minLength: 1 })),
    name: Type.Optional(Type.String({ minLength: 1 })),
    price: Type.Optional(Type.String()),
    currency: Type.Optional(Type.String()),
    billingCycle: Type.Optional(Type.String()),
    features: Type.Optional(Type.Array(Type.String())),
    limits: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    isActive: Type.Optional(Type.Boolean()),
    sortOrder: Type.Optional(Type.Number()),
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
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const UpdateTierResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: TierResponseItem,
});

const updateTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/tier-pricing/admin/:slug',
        method: 'PATCH',
        schema: {
            tags: ['Tier Pricing'],
            params: UpdateTierParams,
            body: UpdateTierBody,
            response: {
                200: UpdateTierResponse,
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
            request: FastifyRequest<{ Params: typeof UpdateTierParams.static, Body: typeof UpdateTierBody.static }>,
            reply: FastifyReply
        ): Promise<typeof UpdateTierResponse.static> {
            const { slug } = request.params;
            const { slug: newSlug, name } = request.body;

            // Check if tier exists
            const existingTier = await db.query.tierPricing.findFirst({
                where: eq(tierPricing.slug, slug)
            });

            if (!existingTier) {
                return reply.notFound(request.i18n.t('tierPricing.update.notFound'));
            }

            // Check for duplicates if slug or name is being updated
            if (newSlug || name) {
                const targetSlug = newSlug || existingTier.slug;
                const targetName = name || existingTier.name;

                const duplicateCheck = await db.query.tierPricing.findFirst({
                    where: and(
                        ne(tierPricing.slug, slug), // Exclude current tier
                        or(
                            eq(tierPricing.slug, targetSlug),
                            eq(tierPricing.name, targetName)
                        )
                    )
                });

                if (duplicateCheck) {
                    return reply.badRequest(request.i18n.t('tierPricing.create.exists'));
                }
            }

            // Update
            const [updatedTier] = await db.update(tierPricing)
                .set({
                    ...request.body,
                    updatedAt: new Date(),
                })
                .where(eq(tierPricing.slug, slug))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('tierPricing.update.success'),
                data: {
                    ...updatedTier,
                    features: updatedTier.features || [],
                    limits: updatedTier.limits || {},
                    createdAt: updatedTier.createdAt.toISOString(),
                    updatedAt: updatedTier.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default updateTierPricingRoute;
