import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { eq, asc } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumDifficultyLevel, EnumQuestionType, EnumSolutionType } from '../../../../db/schema/exam/enums.ts';
import { examQuestionOptions } from '../../../../db/schema/exam/question-options.ts';
import { examQuestionSolutions } from '../../../../db/schema/exam/question-solutions.ts';
import { examQuestionTags } from '../../../../db/schema/exam/question-tags.ts';
import { educationTags } from '../../../../db/schema/education/tags.ts';

const GetQuestionParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const QuestionResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    subjectId: Type.String({ format: 'uuid' }),
    passageId: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    difficulty: Type.Enum(EnumDifficultyLevel),
    type: Type.Enum(EnumQuestionType),
    requiredTier: Type.Union([Type.String(), Type.Null()]),
    educationGradeId: Type.Union([Type.Number(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    options: Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
        content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
        isCorrect: Type.Boolean(),
        order: Type.Number(),
    })),
    solutions: Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
        title: Type.String(),
        content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
        solutionType: Type.Enum(EnumSolutionType),
        order: Type.Number(),
        requiredTier: Type.Union([Type.String(), Type.Null()]),
    })),
    tags: Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String(),
    })),
});

const GetQuestionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: QuestionResponseItem,
});

const getQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/detail/:id',
        method: 'GET',
        schema: {
            tags: ['Admin Exam Questions'],
            params: GetQuestionParams,
            response: {
                200: GetQuestionResponse,
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
            request: FastifyRequest<{ Params: typeof GetQuestionParams.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { id } = request.params;

            const question = await db.query.examQuestions.findFirst({
                where: eq(examQuestions.id, id)
            });

            if (!question) {
                return reply.notFound(t($ => $.exam.questions.update.notFound));
            }

            // Fetch Options
            const options = await db.select({
                id: examQuestionOptions.id,
                content: examQuestionOptions.content,
                isCorrect: examQuestionOptions.isCorrect,
                order: examQuestionOptions.order,
            })
                .from(examQuestionOptions)
                .where(eq(examQuestionOptions.questionId, id))
                .orderBy(asc(examQuestionOptions.order));

            // Fetch Solutions
            const solutions = await db.select({
                id: examQuestionSolutions.id,
                title: examQuestionSolutions.title,
                content: examQuestionSolutions.content,
                solutionType: examQuestionSolutions.solutionType,
                order: examQuestionSolutions.order,
                requiredTier: examQuestionSolutions.requiredTier,
            })
                .from(examQuestionSolutions)
                .where(eq(examQuestionSolutions.questionId, id))
                .orderBy(asc(examQuestionSolutions.order));

            // Fetch Tags
            const tags = await db.select({
                id: educationTags.id,
                name: educationTags.name,
            })
                .from(examQuestionTags)
                .innerJoin(educationTags, eq(examQuestionTags.tagId, educationTags.id))
                .where(eq(examQuestionTags.questionId, id));

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.questions.list.success),
                data: {
                    ...question,
                    createdAt: question.createdAt.toISOString(),
                    updatedAt: question.updatedAt.toISOString(),
                    options,
                    solutions,
                    tags,
                }
            });
        }),
    });
};

export default getQuestionRoute;
