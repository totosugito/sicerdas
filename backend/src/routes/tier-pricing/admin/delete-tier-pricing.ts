import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { tierPricing } from '../../../db/schema/tier-pricing.ts';
import { db } from '../../../db/index.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const DeleteTierResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/tier-pricing/admin/:slug',
        method: 'DELETE',
        schema: {
            tags: ['Tier Pricing'],
            params: Type.Object({
                slug: Type.String(),
            }),
            response: {
                200: DeleteTierResponse,
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
        ): Promise<typeof DeleteTierResponse.static> {
            const { slug } = request.params;

            const existingTier = await db.query.tierPricing.findFirst({
                where: eq(tierPricing.slug, slug)
            });

            if (!existingTier) {
                return reply.notFound(request.i18n.t('tierPricing.delete.notFound'));
            }

            await db.delete(tierPricing).where(eq(tierPricing.slug, slug));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('tierPricing.delete.success'),
            });
        }),
    });
};

export default deleteTierPricingRoute;
