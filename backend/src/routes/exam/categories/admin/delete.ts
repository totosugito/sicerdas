import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examCategories } from '../../../../db/schema/exam/categories.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const DeleteCategoryParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const DeleteCategoryResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteCategoryRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin Exam Categories'],
            params: DeleteCategoryParams,
            response: {
                200: DeleteCategoryResponse,
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
            request: FastifyRequest<{ Params: typeof DeleteCategoryParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            // Ensure category exists
            const existingCategory = await db.query.examCategories.findFirst({
                where: eq(examCategories.id, id)
            });

            if (!existingCategory) {
                return reply.notFound(request.i18n.t('exam.categories.delete.notFound'));
            }

            // Ensure category is not in use by any exam packages
            const inUseCheck = await db.query.examPackages.findFirst({
                where: eq(examPackages.categoryId, id)
            });

            if (inUseCheck) {
                return reply.badRequest(request.i18n.t('exam.categories.delete.inUse'));
            }

            // Perform Hard Delete
            await db.delete(examCategories).where(eq(examCategories.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.categories.delete.success'),
            });
        }),
    });
};

export default deleteCategoryRoute;
