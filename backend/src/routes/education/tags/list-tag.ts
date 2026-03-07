import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { educationTags } from '../../../db/schema/education/tags.ts';
import { examQuestionTags } from '../../../db/schema/exam/question-tags.ts';
import { desc, ilike, or, and, sql, eq, count, getTableColumns, asc } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { fromNodeHeaders } from 'better-auth/node';
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumUserRole } from '../../../db/schema/index.ts';

const TagListQuery = Type.Object({
    search: Type.Optional(Type.String({ description: 'Search term for tag name or description' })),
    isActive: Type.Optional(Type.Boolean()),
    sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt, updatedAt, isActive, name', default: 'updatedAt' })),
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
            tags: ['Exam Tags'],
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
            // Determine user role from session
            const session = await getAuthInstance(app).api.getSession({
                headers: fromNodeHeaders(request.headers),
            });
            const user = session?.user;
            const isAdmin = user?.role === EnumUserRole.ADMIN;

            const { search, isActive, sortOrder = 'desc', page = 1, limit = 10 } = request.body;
            let { sortBy = 'updatedAt' } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [];

            if (!isAdmin) {
                // Client must only see active tags
                conditions.push(eq(educationTags.isActive, true));
                // Force sorting ignoring isActive for clients
                if (sortBy === 'isActive') sortBy = 'name';
            } else {
                // Admin can filter by active status
                if (isActive !== undefined) conditions.push(eq(educationTags.isActive, isActive));
            }

            // Add search condition
            if (search && search.trim() !== '') {
                const searchTerm = `%${search.trim().toLowerCase()}%`;
                conditions.push(
                    or(
                        ilike(educationTags.name, searchTerm),
                        ilike(educationTags.description, searchTerm)
                    )
                );
            }

            // Build Query
            let baseQuery = db.select({
                ...getTableColumns(educationTags),
                totalQuestions: count(examQuestionTags.questionId).mapWith(Number)
            })
                .from(educationTags)
                .leftJoin(examQuestionTags, eq(educationTags.id, examQuestionTags.tagId))
                .groupBy(educationTags.id);

            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Add Sorting
            const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'name':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationTags.name)) : baseQuery.orderBy(desc(educationTags.name));
                    break;
                case 'isActive':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationTags.isActive)) : baseQuery.orderBy(desc(educationTags.isActive));
                    break;
                case 'updatedAt':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationTags.updatedAt)) : baseQuery.orderBy(desc(educationTags.updatedAt));
                    break;
                case 'createdAt':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationTags.createdAt)) : baseQuery.orderBy(desc(educationTags.createdAt));
                    break;
                default:
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationTags.name)) : baseQuery.orderBy(desc(educationTags.name));
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
                message: request.i18n.t('education.tags.list.success'),
                data: {
                    items: items.map(tag => ({
                        ...tag,
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
