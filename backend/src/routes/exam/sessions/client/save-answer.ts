import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examSessions } from '../../../../db/schema/exam/sessions.ts';
import { examSessionAnswers } from '../../../../db/schema/exam/session-answers.ts';
import { EnumExamSessionStatus } from '../../../../db/schema/exam/enums.ts';
import { eq, and } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const SaveAnswerBody = Type.Object({
    sessionId: Type.String({ format: 'uuid' }),
    questionId: Type.String({ format: 'uuid' }),
    selectedOptionId: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
    textAnswer: Type.Optional(Type.Union([Type.Array(Type.Record(Type.String(), Type.Unknown())), Type.Null()])),
    isDoubtful: Type.Optional(Type.Boolean()),
});

const SaveAnswerResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const saveAnswerRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/save-answer',
        method: 'POST',
        schema: {
            tags: ['Client Exam Sessions'],
            body: SaveAnswerBody,
            response: {
                200: SaveAnswerResponse,
                403: Type.Object({ success: Type.Boolean(), message: Type.String() }),
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof SaveAnswerBody.static }>,
            reply: FastifyReply
        ) {
            const { sessionId, questionId, selectedOptionId, textAnswer, isDoubtful } = request.body;
            const userId = (request as any).session.user.id;

            // 1. Verify session ownership and status
            const [session] = await db.select({ id: examSessions.id, status: examSessions.status })
                .from(examSessions)
                .where(and(eq(examSessions.id, sessionId), eq(examSessions.userId, userId)))
                .limit(1);

            if (!session) {
                return reply.notFound(request.i18n.t('exam.sessions.saveAnswer.notFound'));
            }

            if (session.status !== EnumExamSessionStatus.IN_PROGRESS) {
                return reply.forbidden(request.i18n.t('exam.sessions.saveAnswer.finished'));
            }

            // 2. Update the answer
            const updateData: any = { updatedAt: new Date() };
            if (selectedOptionId !== undefined) updateData.selectedOptionId = selectedOptionId;
            if (textAnswer !== undefined) updateData.textAnswer = textAnswer;
            if (isDoubtful !== undefined) updateData.isDoubtful = isDoubtful;

            await db.update(examSessionAnswers)
                .set(updateData)
                .where(and(
                    eq(examSessionAnswers.sessionId, sessionId),
                    eq(examSessionAnswers.questionId, questionId)
                ));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.sessions.saveAnswer.success'),
            });
        }),
    });
};

export default saveAnswerRoute;
