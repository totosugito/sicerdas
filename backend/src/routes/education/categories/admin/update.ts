import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { educationCategories } from '../../../../db/schema/education/categories.ts';
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
            const existingCategory = await db.query.educationCategories.findFirst({
                where: eq(educationCategories.id, id)
            });

            if (!existingCategory) {
                return reply.notFound(request.i18n.t('education.categories.update.notFound'));
            }

            // Check if new name conflicts with another existing category
            const nameConflict = await db.query.educationCategories.findFirst({
                where: and(
                    eq(educationCategories.name, name),
                    ne(educationCategories.id, id)
                )
            });

            if (nameConflict) {
                return reply.badRequest(request.i18n.t('education.categories.update.exists'));
            }

            const [updatedCategory] = await db.update(educationCategories)
                .set({
                    name,
                    description,
                    isActive,
                    updatedAt: new Date()
                })
                .where(eq(educationCategories.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('education.categories.update.success'),
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
