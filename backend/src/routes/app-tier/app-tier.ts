import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { appTier } from '../../db/schema/app/app-tier.ts';
import { db } from '../../db/db-pool.ts';
import { asc, eq } from 'drizzle-orm';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";

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

const ListTierResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Array(TierResponseItem),
});

const clientTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/app-tier',
        method: 'GET',
        schema: {
            tags: ['App Tier'],
            response: {
                200: ListTierResponse,
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
            request: FastifyRequest,
            reply: FastifyReply
        ): Promise<typeof ListTierResponse.static> {
            const tiers = await db.query.appTier.findMany({
                where: eq(appTier.isActive, true),
                orderBy: [asc(appTier.sortOrder)]
            });

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('appTier.listSuccess'),
                data: tiers.map(tier => ({
                    ...tier,
                    features: tier.features || [],
                    limits: tier.limits || {},
                    createdAt: tier.createdAt.toISOString(),
                    updatedAt: tier.updatedAt.toISOString(),
                }))
            });
        }),
    });
};

export default clientTierPricingRoute;
