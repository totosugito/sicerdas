import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examCategories } from '../../../../db/schema/exam/categories.ts';
import { eq, and, ne } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const UpdateCategoryParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const UpdateCategoryBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean()),
});

const CategoryResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const UpdateCategoryResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: CategoryResponseItem,
});

const updateCategoryRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Exam Categories'],
            params: UpdateCategoryParams,
            body: UpdateCategoryBody,
            response: {
                200: UpdateCategoryResponse,
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
            request: FastifyRequest<{ Params: typeof UpdateCategoryParams.static, Body: typeof UpdateCategoryBody.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const { name, description, isActive } = request.body;

            // Ensure category exists
            const existingCategory = await db.query.examCategories.findFirst({
                where: eq(examCategories.id, id)
            });

            if (!existingCategory) {
                return reply.notFound(request.i18n.t('exam.categories.update.notFound'));
            }

            // Check if new name conflicts with another existing category
            const nameConflict = await db.query.examCategories.findFirst({
                where: and(
                    eq(examCategories.name, name),
                    ne(examCategories.id, id)
                )
            });

            if (nameConflict) {
                return reply.badRequest(request.i18n.t('exam.categories.update.exists'));
            }

            // Build dynamic update payload to prevent overriding isActive with undefined if not supplied
            const updatePayload: any = {
                name,
                description,
                updatedAt: new Date()
            };

            if (isActive !== undefined) {
                updatePayload.isActive = isActive;
            }

            const [updatedCategory] = await db.update(examCategories)
                .set(updatePayload)
                .where(eq(examCategories.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.categories.update.success'),
                data: {
                    ...updatedCategory,
                    createdAt: updatedCategory.createdAt.toISOString(),
                    updatedAt: updatedCategory.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default updateCategoryRoute;
