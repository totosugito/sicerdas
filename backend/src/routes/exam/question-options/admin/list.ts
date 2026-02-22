import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionOptions } from '../../../../db/schema/exam/question-options.ts';
import { desc, and, sql, eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const QuestionOptionListQuery = Type.Object({
    questionId: Type.Optional(Type.String({ format: 'uuid', description: 'Filter by parent Question ID' })),
    isCorrect: Type.Optional(Type.Boolean({ description: 'Filter by correct answer status' })),

    sortBy: Type.Optional(Type.String({ description: 'Sort field: order', default: 'order' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'asc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const QuestionOptionResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    questionId: Type.String({ format: 'uuid' }),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    isCorrect: Type.Boolean(),
    order: Type.Number(),
});

const ListQuestionOptionsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(QuestionOptionResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Options'],
            body: QuestionOptionListQuery,
            response: {
                200: ListQuestionOptionsResponse,
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
            request: FastifyRequest<{ Body: typeof QuestionOptionListQuery.static }>,
            reply: FastifyReply
        ) {
            const {
                questionId, isCorrect,
                sortBy = 'order', sortOrder = 'asc', page = 1, limit = 10
            } = request.body;

            const offset = (page - 1) * limit;

            const conditions = [];

            if (questionId) conditions.push(eq(examQuestionOptions.questionId, questionId));
            if (isCorrect !== undefined) conditions.push(eq(examQuestionOptions.isCorrect, isCorrect));

            // Build Query
            let baseQuery = db.select().from(examQuestionOptions);
            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Add Sorting
            const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'order':
                default:
                    queryWithSort = orderDir === 'asc'
                        ? baseQuery.orderBy(examQuestionOptions.order)
                        : baseQuery.orderBy(desc(examQuestionOptions.order));
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
                message: request.i18n.t('exam.question-options.list.success'),
                data: {
                    items: items.map(opt => ({
                        id: opt.id,
                        questionId: opt.questionId,
                        content: opt.content as Record<string, unknown>[],
                        isCorrect: opt.isCorrect,
                        order: opt.order
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

export default listQuestionOptionRoute;
