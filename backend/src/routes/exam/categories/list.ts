import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { examCategories } from '../../../db/schema/exam/categories.ts';
import { desc, ilike, or, and, sql, eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const CategoryListQuery = Type.Object({
    search: Type.Optional(Type.String({ description: 'Search term for category name or description' })),
    isActive: Type.Optional(Type.Boolean({ description: 'Filter by active status. Omit to fetch all.' })),
    sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt, updatedAt, name, isActive', default: 'name' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'asc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const CategoryResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ListCategoriesResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(CategoryResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listCategoryRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST', // Changed to POST to conventionally accept complex query body like in `list-book.ts`
        schema: {
            tags: ['Exam Categories'],
            body: CategoryListQuery,
            response: {
                200: ListCategoriesResponse,
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
            request: FastifyRequest<{ Body: typeof CategoryListQuery.static }>,
            reply: FastifyReply
        ) {
            const { search, isActive, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [];

            // Add active status condition if provided
            if (isActive !== undefined) {
                conditions.push(eq(examCategories.isActive, isActive));
            }

            // Add search condition
            if (search && search.trim() !== '') {
                const searchTerm = `%${search.trim().toLowerCase()}%`;
                conditions.push(
                    or(
                        ilike(examCategories.name, searchTerm),
                        ilike(examCategories.description, searchTerm)
                    )
                );
            }

            // Build Query
            let baseQuery = db.select().from(examCategories);
            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Add Sorting
            const order = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'name':
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examCategories.name)
                        : baseQuery.orderBy(desc(examCategories.name));
                    break;
                case 'isActive':
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examCategories.isActive)
                        : baseQuery.orderBy(desc(examCategories.isActive));
                    break;
                case 'updatedAt':
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examCategories.updatedAt)
                        : baseQuery.orderBy(desc(examCategories.updatedAt));
                    break;
                case 'createdAt':
                default:
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examCategories.createdAt)
                        : baseQuery.orderBy(desc(examCategories.createdAt));
                    break;
            }

            // Meta calculations
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(queryWithSort.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Execute Paginated Fetch
            const items = await queryWithSort
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.categories.list.success'),
                data: {
                    items: items.map(cat => ({
                        ...cat,
                        createdAt: cat.createdAt.toISOString(),
                        updatedAt: cat.updatedAt.toISOString(),
                    })),
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

export default listCategoryRoute;
