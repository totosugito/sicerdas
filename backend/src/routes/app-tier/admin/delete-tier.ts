import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { appTier } from '../../../db/schema/app/index.ts';
import { usersProfile } from '../../../db/schema/user/index.ts';
import { aiModels } from '../../../db/schema/ai/index.ts';
import { db } from '../../../db/db-pool.ts';
import { eq, count } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from '../../../utils/i18n-typed.ts';

const DeleteTierResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteTierPricingRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/:slug',
        method: 'DELETE',
        schema: {
            tags: ['App Tier'],
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
            const { t } = getTypedI18n(request);
            const { slug } = request.params;

            if (['free', 'pro', 'enterprise'].includes(slug)) {
                return reply.badRequest(t($ => $.appTier.delete.defaultData));
            }

            const existingTier = await db.query.appTier.findFirst({
                where: eq(appTier.slug, slug)
            });

            if (!existingTier) {
                return reply.notFound(t($ => $.appTier.delete.notFound));
            }

            // Check if tier is being used by any user profiles
            const [userProfileCount] = await db
                .select({ count: count() })
                .from(usersProfile)
                .where(eq(usersProfile.tierId, slug));

            if (userProfileCount.count > 0) {
                return reply.badRequest(
                    t($ => $.appTier.delete.usedByUsers, { count: userProfileCount.count }) ??
                    `Cannot delete tier. It is currently being used by ${userProfileCount.count} user(s).`
                );
            }

            // Check if tier is being used by any AI models
            const [aiModelCount] = await db
                .select({ count: count() })
                .from(aiModels)
                .where(eq(aiModels.requiredTierId, slug));

            if (aiModelCount.count > 0) {
                return reply.badRequest(
                    t($ => $.appTier.delete.usedByModels, { count: aiModelCount.count }) ??
                    `Cannot delete tier. It is currently required by ${aiModelCount.count} AI model(s).`
                );
            }

            await db.delete(appTier).where(eq(appTier.slug, slug));

            return reply.status(200).send({
                success: true,
                message: t($ => $.appTier.delete.success),
            });
        }),
    });
};

export default deleteTierPricingRoute;
