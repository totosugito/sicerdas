import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { examQuestionOptions } from '../../../../db/schema/exam/question-options.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { educationTags } from '../../../../db/schema/education/tags.ts';
import { desc, and, sql, eq, count, getTableColumns } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const QuestionListQuery = Type.Object({
    // Since content is a JSONB BlockNote blob, search by text won't be a simple ILIKE on a varchar.
    // Drizzle ILIKE on JSONB text cast is possible but heavier. Left here for extension if needed.
    search: Type.Optional(Type.String({ description: 'Search term for question content' })),

    // Filters specific to questions
    subjectId: Type.Optional(Type.String({ format: 'uuid' })),
    difficulty: Type.Optional(Type.String()),
    type: Type.Optional(Type.String()),
    requiredTier: Type.Optional(Type.String()),
    educationGradeId: Type.Optional(Type.Number()),

    isActive: Type.Optional(Type.Boolean({ description: 'Filter by active status. Omit to fetch all.' })),
    sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt', default: 'createdAt' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'desc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const QuestionResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    subjectId: Type.String({ format: 'uuid' }),
    passageId: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    difficulty: Type.String(),
    type: Type.String(),
    requiredTier: Type.Union([Type.String(), Type.Null()]),
    educationGradeId: Type.Union([Type.Number(), Type.Null()]),
    isActive: Type.Boolean(),
    totalOptions: Type.Number(),
    tags: Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String()
    })),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ListQuestionsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(QuestionResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Questions'],
            body: QuestionListQuery,
            response: {
                200: ListQuestionsResponse,
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
            request: FastifyRequest<{ Body: typeof QuestionListQuery.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const {
                subjectId, difficulty, type, requiredTier, educationGradeId, isActive,
                sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10
            } = request.body;

            const offset = (page - 1) * limit;

            const conditions = [];

            // Add active status condition if provided
            if (isActive !== undefined) {
                conditions.push(eq(examQuestions.isActive, isActive));
            }

            // Direct match filters
            if (subjectId) conditions.push(eq(examQuestions.subjectId, subjectId));
            if (difficulty) conditions.push(eq(examQuestions.difficulty, difficulty as any));
            if (type) conditions.push(eq(examQuestions.type, type as any));
            if (requiredTier) conditions.push(eq(examQuestions.requiredTier, requiredTier));
            if (educationGradeId) conditions.push(eq(examQuestions.educationGradeId, educationGradeId));

            // Optional: Search inside JSONB (requires casting JSONB text, omitted here for performance unless strictly necessary)
            // if (search && search.trim() !== '') {
            //     const searchTerm = `%${search.trim().toLowerCase()}%`;
            //     conditions.push(ilike(sql`${examQuestions.content}::text`, searchTerm));
            // }

            // Build Query
            let baseQuery = db.select({
                ...getTableColumns(examQuestions),
                totalOptions: count(examQuestionOptions.id).mapWith(Number),
                tags: sql`coalesce(
                    json_agg(
                        json_build_object('id', ${educationTags.id}, 'name', ${educationTags.name})
                    ) filter (where ${educationTags.id} is not null), 
                    '[]'
                )`.as('tags')
            })
                .from(examQuestions)
                .leftJoin(examQuestionOptions, eq(examQuestions.id, examQuestionOptions.questionId))
                .leftJoin(examQuestionTags, eq(examQuestions.id, examQuestionTags.questionId))
                .leftJoin(educationTags, eq(examQuestionTags.tagId, educationTags.id))
                .groupBy(examQuestions.id);

            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Add Sorting
            const order = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'createdAt':
                default:
                    queryWithSort = order === 'asc'
                        ? baseQuery.orderBy(examQuestions.createdAt)
                        : baseQuery.orderBy(desc(examQuestions.createdAt));
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
                message: t($ => $.exam.questions.list.success),
                data: {
                    items: items.map(q => ({
                        id: q.id,
                        subjectId: q.subjectId,
                        passageId: q.passageId,
                        content: q.content as Record<string, unknown>[],
                        difficulty: q.difficulty,
                        type: q.type,
                        requiredTier: q.requiredTier,
                        educationGradeId: q.educationGradeId,
                        isActive: q.isActive,
                        totalOptions: q.totalOptions,
                        tags: (q as any).tags as { id: string, name: string }[],
                        createdAt: q.createdAt.toISOString(),
                        updatedAt: q.updatedAt.toISOString(),
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

export default listQuestionRoute;
