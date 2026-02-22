import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestionSolutions } from '../../../../db/schema/exam/question-solutions.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { EnumSolutionType } from '../../../../db/schema/exam/enums.ts';

const UpdateQuestionSolutionParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const UpdateQuestionSolutionBody = Type.Object({
    questionId: Type.Optional(Type.String({ format: 'uuid' })),
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
    solutionType: Type.Optional(Type.Enum(EnumSolutionType)),
    order: Type.Optional(Type.Number()),
    requiredTier: Type.Optional(Type.Union([Type.String(), Type.Null()]))
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

const UpdateQuestionSolutionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: QuestionSolutionResponseItem,
});

const updateQuestionSolutionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Exam Question Solutions'],
            params: UpdateQuestionSolutionParams,
            body: UpdateQuestionSolutionBody,
            response: {
                200: UpdateQuestionSolutionResponse,
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
            request: FastifyRequest<{ Params: typeof UpdateQuestionSolutionParams.static, Body: typeof UpdateQuestionSolutionBody.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const { questionId, title, content, solutionType, order, requiredTier } = request.body;

            // Ensure solution exists
            const existingSolution = await db.query.examQuestionSolutions.findFirst({
                where: eq(examQuestionSolutions.id, id)
            });

            if (!existingSolution) {
                return reply.notFound(request.i18n.t('exam.question-solutions.update.notFound'));
            }

            // Verify new question exists if provided
            if (questionId !== undefined) {
                const existingQuestion = await db.query.examQuestions.findFirst({
                    where: eq(examQuestions.id, questionId)
                });
                if (!existingQuestion) {
                    return reply.badRequest(request.i18n.t('exam.question-solutions.update.invalidQuestion'));
                }
            }

            // Build dynamic update payload
            const updatePayload: any = {
                updatedAt: new Date()
            };

            if (questionId !== undefined) updatePayload.questionId = questionId;
            if (title !== undefined) updatePayload.title = title;
            if (content !== undefined) updatePayload.content = content;
            if (solutionType !== undefined) updatePayload.solutionType = solutionType;
            if (order !== undefined) updatePayload.order = order;
            if (requiredTier !== undefined) updatePayload.requiredTier = requiredTier;

            const [updatedSolution] = await db.update(examQuestionSolutions)
                .set(updatePayload)
                .where(eq(examQuestionSolutions.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.question-solutions.update.success'),
                data: {
                    ...updatedSolution,
                    createdAt: updatedSolution.createdAt.toISOString(),
                    updatedAt: updatedSolution.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default updateQuestionSolutionRoute;
