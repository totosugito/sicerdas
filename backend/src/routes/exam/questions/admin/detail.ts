import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";
import { EnumDifficultyLevel, EnumQuestionType } from '../../../../db/schema/exam/enums.ts';

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

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.questions.list.success),
                data: {
                    ...question,
                    createdAt: question.createdAt.toISOString(),
                    updatedAt: question.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default getQuestionRoute;
