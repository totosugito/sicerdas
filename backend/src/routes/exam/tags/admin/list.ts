import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examTags } from '../../../../db/schema/exam/tags.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { desc, ilike, or, and, sql, eq, count, getTableColumns } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const TagListQuery = Type.Object({
    search: Type.Optional(Type.String({ description: 'Search term for tag name or description' })),
    isActive: Type.Optional(Type.Boolean({ description: 'Filter by active status. Omit to fetch all.' })),
    sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt, updatedAt, isActive, name', default: 'createdAt' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'desc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const TagResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    totalQuestions: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ListTagsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(TagResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listTagRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Tags'],
            body: TagListQuery,
            response: {
                200: ListTagsResponse,
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
            request: FastifyRequest<{ Body: typeof TagListQuery.static }>,
            reply: FastifyReply
        ) {
            const { search, isActive, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [];

            // Add active status condition if provided
            if (isActive !== undefined) {
                conditions.push(eq(examTags.isActive, isActive));
            }

            // Add search condition
            if (search && search.trim() !== '') {
                const searchTerm = `%${search.trim().toLowerCase()}%`;
                conditions.push(
                    or(
                        ilike(examTags.name, searchTerm),
                        ilike(examTags.description, searchTerm)
                    )
                );
            }

            // Build Query
            let baseQuery = db.select({
                ...getTableColumns(examTags),
                totalQuestions: count(examQuestionTags.questionId).mapWith(Number)
            })
                .from(examTags)
                .leftJoin(examQuestionTags, eq(examTags.id, examQuestionTags.tagId))
                .groupBy(examTags.id);

            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Add Sorting
            const order = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'name':
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examTags.name)
                        : baseQuery.orderBy(desc(examTags.name));
                    break;
                case 'isActive':
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examTags.isActive)
                        : baseQuery.orderBy(desc(examTags.isActive));
                    break;
                case 'updatedAt':
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examTags.updatedAt)
                        : baseQuery.orderBy(desc(examTags.updatedAt));
                    break;
                case 'createdAt':
                default:
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examTags.createdAt)
                        : baseQuery.orderBy(desc(examTags.createdAt));
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
                message: request.i18n.t('exam.tags.list.success'),
                data: {
                    items: items.map(tag => ({
                        id: tag.id,
                        name: tag.name,
                        description: tag.description,
                        isActive: tag.isActive,
                        totalQuestions: tag.totalQuestions,
                        createdAt: tag.createdAt.toISOString(),
                        updatedAt: tag.updatedAt.toISOString(),
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

export default listTagRoute;
