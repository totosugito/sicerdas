import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { educationCategories } from '../../../db/schema/education/categories.ts';
import { and, eq, asc, sql } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const CategorySimpleQuery = Type.Object({
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const CategorySimpleResponseItem = Type.Object({
    value: Type.String({ format: 'uuid' }),
    label: Type.String(),
});

const ListCategoriesSimpleResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(CategorySimpleResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listCategoriesSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list-simple',
        method: 'POST',
        schema: {
            tags: ['Exam Categories'],
            body: CategorySimpleQuery,
            response: {
                200: ListCategoriesSimpleResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof CategorySimpleQuery.static }>,
            reply: FastifyReply
        ) {
            const { page = 1, limit = 1000 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [eq(educationCategories.isActive, true)];

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(educationCategories)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await db.select({
                value: educationCategories.id,
                label: educationCategories.name,
            })
                .from(educationCategories)
                .where(and(...conditions))
                .orderBy(asc(educationCategories.name))
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('education.categories.list.success'),
                data: {
                    items,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages,
                    }
                }
            });
        }),
    });
};

export default listCategoriesSimpleRoute;
