import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionSolutions } from '../../../../db/schema/exam/question-solutions.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { EnumSolutionType } from '../../../../db/schema/exam/enums.ts';

const CreateQuestionSolutionBody = Type.Object({
    questionId: Type.String({ format: 'uuid' }),
    title: Type.String({ minLength: 1, maxLength: 255 }),
    content: Type.Array(Type.Record(Type.String(), Type.Unknown())), // BlockNote JSON format
    solutionType: Type.Optional(Type.Enum(EnumSolutionType, { default: EnumSolutionType.GENERAL })),
    order: Type.Optional(Type.Number({ default: 0 })),
    requiredTier: Type.Optional(Type.String({ default: 'free' }))
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

const CreateQuestionSolutionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: QuestionSolutionResponseItem,
});

const createQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/create',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Question Solutions'],
            body: CreateQuestionSolutionBody,
            response: {
                201: CreateQuestionSolutionResponse,
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
            request: FastifyRequest<{ Body: typeof CreateQuestionSolutionBody.static }>,
            reply: FastifyReply
        ) {
            const { questionId, title, content, solutionType, order, requiredTier } = request.body;

            // Verify that the parent question exists
            const existingQuestion = await db.query.examQuestions.findFirst({
                where: eq(examQuestions.id, questionId)
            });

            if (!existingQuestion) {
                return reply.badRequest(request.i18n.t('exam.question-solutions.create.invalidQuestion'));
            }

            const [newSolution] = await db.insert(examQuestionSolutions).values({
                questionId,
                title,
                content,
                solutionType,
                order: order !== undefined ? order : 0,
                requiredTier: requiredTier || 'free'
            }).returning();

            return reply.status(201).send({
                success: true,
                message: request.i18n.t('exam.question-solutions.create.success'),
                data: {
                    ...newSolution,
                    createdAt: newSolution.createdAt.toISOString(),
                    updatedAt: newSolution.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default createQuestionSolutionRoute;
