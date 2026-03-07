import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { educationCategories } from '../../../../db/schema/education/categories.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const CreateCategoryBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean({ default: true })),
});

const CategoryResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const CreateCategoryResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: CategoryResponseItem,
});

const createCategoryRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Categories'],
            body: CreateCategoryBody,
            response: {
                201: CreateCategoryResponse,
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
            request: FastifyRequest<{ Body: typeof CreateCategoryBody.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { name, description, isActive } = request.body;

            // Check if name already exists
            const existingCategory = await db.query.educationCategories.findFirst({
                where: eq(educationCategories.name, name)
            });

            if (existingCategory) {
                return reply.badRequest(t($ => $.education.categories.create.exists));
            }

            const [newCategory] = await db.insert(educationCategories).values({
                name,
                description,
                isActive: isActive ?? true,
            }).returning();

            return reply.status(201).send({
                success: true,
                message: t($ => $.education.categories.create.success),
                data: {
                    ...newCategory,
                    createdAt: newCategory.createdAt.toISOString(),
                    updatedAt: newCategory.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default createCategoryRoute;
