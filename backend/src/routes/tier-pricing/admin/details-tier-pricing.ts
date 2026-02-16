import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { tierPricing } from '../../../db/schema/tier-pricing.ts';
import { db } from '../../../db/index.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

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

const GetTierResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: TierResponseItem,
});

const detailsTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/tier-pricing/admin/:slug',
        method: 'GET',
        schema: {
            tags: ['Tier Pricing'],
            params: Type.Object({
                slug: Type.String(),
            }),
            response: {
                200: GetTierResponse,
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
            request: FastifyRequest<{ Params: { slug: string } }>,
            reply: FastifyReply
        ): Promise<typeof GetTierResponse.static> {
            const { slug } = request.params;

            const tier = await db.query.tierPricing.findFirst({
                where: eq(tierPricing.slug, slug)
            });

            if (!tier) {
                return reply.notFound(request.i18n.t('tierPricing.details.notFound'));
            }

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('tierPricing.details.found'),
                data: {
                    ...tier,
                    features: tier.features || [],
                    limits: tier.limits || {},
                    createdAt: tier.createdAt.toISOString(),
                    updatedAt: tier.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default detailsTierPricingRoute;
