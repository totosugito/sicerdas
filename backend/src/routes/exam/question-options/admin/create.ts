import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionOptions } from '../../../../db/schema/exam/question-options.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const CreateQuestionOptionBody = Type.Object({
    questionId: Type.String({ format: 'uuid' }),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())), // BlockNote JSON format
    isCorrect: Type.Optional(Type.Boolean({ default: false })),
    order: Type.Optional(Type.Number({ default: 0 })),
});

const QuestionOptionResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    questionId: Type.String({ format: 'uuid' }),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
    isCorrect: Type.Boolean(),
    order: Type.Number(),
});

const CreateQuestionOptionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: QuestionOptionResponseItem,
});

const createQuestionOptionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Options'],
            body: CreateQuestionOptionBody,
            response: {
                201: CreateQuestionOptionResponse,
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
            request: FastifyRequest<{ Body: typeof CreateQuestionOptionBody.static }>,
            reply: FastifyReply
        ) {
            const { questionId, content, isCorrect, order } = request.body;

            // Verify that the parent question exists
            const existingQuestion = await db.query.examQuestions.findFirst({
                where: eq(examQuestions.id, questionId)
            });

            if (!existingQuestion) {
                return reply.badRequest(request.i18n.t('exam.question-options.create.invalidQuestion'));
            }

            const [newOption] = await db.insert(examQuestionOptions).values({
                questionId,
                content,
                isCorrect: isCorrect !== undefined ? isCorrect : false,
                order: order !== undefined ? order : 0,
            }).returning();

            return reply.status(201).send({
                success: true,
                message: request.i18n.t('exam.question-options.create.success'),
                data: newOption
            });
        }),
    });
};

export default createQuestionOptionRoute;
