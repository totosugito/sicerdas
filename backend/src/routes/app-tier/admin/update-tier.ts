import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { appTier } from '../../../db/schema/app/index.ts';
import { db } from '../../../db/db-pool.ts';
import { eq, ne, and, or } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const UpdateTierParams = Type.Object({
    slug: Type.String(),
});

const UpdateTierBody = Type.Object({
    name: Type.Optional(Type.String({ minLength: 1 })),
    price: Type.Optional(Type.String()),
    currency: Type.Optional(Type.String()),
    billingCycle: Type.Optional(Type.String()),
    features: Type.Optional(Type.Array(Type.String())),
    limits: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    isActive: Type.Optional(Type.Boolean()),
    sortOrder: Type.Optional(Type.Number()),
    isPopular: Type.Optional(Type.Boolean()),
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

const UpdateTierResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: TierResponseItem,
});

const updateTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/:slug',
        method: 'PATCH',
        schema: {
            tags: ['App Tier'],
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

            // Check if tier exists
            const existingTier = await db.query.appTier.findFirst({
                where: eq(appTier.slug, slug)
            });

            if (!existingTier) {
                return reply.notFound(request.i18n.t('appTier.update.notFound'));
            }

            // Prepare update data
            // Explicitly exclude slug from update data to ensure it cannot be changed
            const { slug: _, ...updateData } = { ...request.body } as any;

            // Ignore isActive updates for default tiers (free, pro)
            if (['free', 'pro', 'enterprise'].includes(slug)) {
                delete updateData.isActive;
            }

            const { name } = updateData;

            // Check for duplicates if name is being updated
            if (name) {
                const targetSlug = existingTier.slug;
                const targetName = name || existingTier.name;

                const duplicateCheck = await db.query.appTier.findFirst({
                    where: and(
                        ne(appTier.slug, slug), // Exclude current tier
                        or(
                            eq(appTier.slug, targetSlug),
                            eq(appTier.name, targetName)
                        )
                    )
                });

                if (duplicateCheck) {
                    return reply.badRequest(request.i18n.t('appTier.create.exists'));
                }
            }

            // Update
            const [updatedTier] = await db.update(appTier)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(eq(appTier.slug, slug))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('appTier.update.success'),
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
