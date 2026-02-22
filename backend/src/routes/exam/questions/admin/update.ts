import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examQuestions } from '../../../../db/schema/exam/questions.ts';
import { examSubjects } from '../../../../db/schema/exam/subjects.ts';
import { examPassages } from '../../../../db/schema/exam/passages.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { EnumDifficultyLevel, EnumQuestionType } from '../../../../db/schema/exam/enums.ts';

const UpdateQuestionParams = Type.Object({
    id: Type.String({ format: 'uuid' })
});

const UpdateQuestionBody = Type.Object({
    subjectId: Type.Optional(Type.String({ format: 'uuid' })),
    passageId: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
    content: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Unknown()))),
    difficulty: Type.Optional(Type.Enum(EnumDifficultyLevel)),
    type: Type.Optional(Type.Enum(EnumQuestionType)),
    requiredTier: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    educationGradeId: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    isActive: Type.Optional(Type.Boolean()),
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
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const UpdateQuestionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: QuestionResponseItem,
});

const updateQuestionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Exam Questions'],
            params: UpdateQuestionParams,
            body: UpdateQuestionBody,
            response: {
                200: UpdateQuestionResponse,
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
            request: FastifyRequest<{ Params: typeof UpdateQuestionParams.static, Body: typeof UpdateQuestionBody.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const {
                subjectId, passageId, content, difficulty,
                type, requiredTier, educationGradeId, isActive
            } = request.body;

            // Ensure question exists
            const existingQuestion = await db.query.examQuestions.findFirst({
                where: eq(examQuestions.id, id)
            });

            if (!existingQuestion) {
                return reply.notFound(request.i18n.t('exam.questions.update.notFound'));
            }

            // Verify new subject exists if provided
            if (subjectId !== undefined) {
                const existingSubject = await db.query.examSubjects.findFirst({
                    where: eq(examSubjects.id, subjectId)
                });
                if (!existingSubject) {
                    return reply.badRequest(request.i18n.t('exam.questions.update.invalidSubject'));
                }
            }

            // Verify new passage exists if provided (and not explicitly nullified)
            if (passageId !== undefined && passageId !== null) {
                const existingPassage = await db.query.examPassages.findFirst({
                    where: eq(examPassages.id, passageId)
                });
                if (!existingPassage) {
                    return reply.badRequest(request.i18n.t('exam.questions.update.invalidPassage'));
                }
            }

            // Build dynamic update payload
            const updatePayload: any = {
                updatedAt: new Date()
            };

            if (subjectId !== undefined) updatePayload.subjectId = subjectId;
            if (passageId !== undefined) updatePayload.passageId = passageId;
            if (content !== undefined) updatePayload.content = content;
            if (difficulty !== undefined) updatePayload.difficulty = difficulty;
            if (type !== undefined) updatePayload.type = type;
            if (requiredTier !== undefined) updatePayload.requiredTier = requiredTier;
            if (educationGradeId !== undefined) updatePayload.educationGradeId = educationGradeId;
            if (isActive !== undefined) updatePayload.isActive = isActive;

            const [updatedQuestion] = await db.update(examQuestions)
                .set(updatePayload)
                .where(eq(examQuestions.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.questions.update.success'),
                data: {
                    ...updatedQuestion,
                    createdAt: updatedQuestion.createdAt.toISOString(),
                    updatedAt: updatedQuestion.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default updateQuestionRoute;
