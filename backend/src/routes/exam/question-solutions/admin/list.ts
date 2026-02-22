import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionSolutions } from '../../../../db/schema/exam/question-solutions.ts';
import { desc, and, sql, eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const QuestionSolutionListQuery = Type.Object({
    questionId: Type.Optional(Type.String({ format: 'uuid', description: 'Filter by parent Question ID' })),
    solutionType: Type.Optional(Type.String({ description: 'Filter by solution type (e.g. general, fast_method)' })),
    requiredTier: Type.Optional(Type.String({ description: 'Filter by subscription tier required' })),

    sortBy: Type.Optional(Type.String({ description: 'Sort field: order, createdAt', default: 'order' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'asc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const QuestionSolutionResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    questionId: Type.String({ format: 'uuid' }),
    title: Type.String(),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    solutionType: Type.String(),
    order: Type.Number(),
    requiredTier: Type.Union([Type.String(), Type.Null()]),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ListQuestionSolutionsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(QuestionSolutionResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Solutions'],
            body: QuestionSolutionListQuery,
            response: {
                200: ListQuestionSolutionsResponse,
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
            request: FastifyRequest<{ Body: typeof QuestionSolutionListQuery.static }>,
            reply: FastifyReply
        ) {
            const {
                questionId, solutionType, requiredTier,
                sortBy = 'order', sortOrder = 'asc', page = 1, limit = 10
            } = request.body;

            const offset = (page - 1) * limit;

            const conditions = [];

            if (questionId) conditions.push(eq(examQuestionSolutions.questionId, questionId));
            if (solutionType) conditions.push(eq(examQuestionSolutions.solutionType, solutionType as any));
            if (requiredTier) conditions.push(eq(examQuestionSolutions.requiredTier, requiredTier));

            // Build Query
            let baseQuery = db.select().from(examQuestionSolutions);
            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Add Sorting
            const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'createdAt':
                    queryWithSort = orderDir === 'asc'
                        ? baseQuery.orderBy(examQuestionSolutions.createdAt)
                        : baseQuery.orderBy(desc(examQuestionSolutions.createdAt));
                    break;
                case 'order':
                default:
                    queryWithSort = orderDir === 'asc'
                        ? baseQuery.orderBy(examQuestionSolutions.order)
                        : baseQuery.orderBy(desc(examQuestionSolutions.order));
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
                message: request.i18n.t('exam.question-solutions.list.success'),
                data: {
                    items: items.map(sol => ({
                        ...sol,
                        content: sol.content as Record<string, unknown>[],
                        createdAt: sol.createdAt.toISOString(),
                        updatedAt: sol.updatedAt.toISOString(),
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

export default listQuestionSolutionRoute;
