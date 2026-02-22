import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examSessions } from '../../../../db/schema/exam/sessions.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { examPackageQuestions } from '../../../../db/schema/exam/package-questions.ts';
import { examSessionAnswers } from '../../../../db/schema/exam/session-answers.ts';
import { EnumExamSessionStatus } from '../../../../db/schema/exam/enums.ts';
import { eq, and } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const StartSessionBody = Type.Object({
    packageId: Type.String({ format: 'uuid' }),
});

const StartSessionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        sessionId: Type.String({ format: 'uuid' }),
    }),
});

const startSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/start',
        method: 'POST',
        schema: {
            tags: ['Client Exam Sessions'],
            body: StartSessionBody,
            response: {
                201: StartSessionResponse,
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof StartSessionBody.static }>,
            reply: FastifyReply
        ) {
            const { packageId } = request.body;
            const userId = (request as any).session.user.id;

            // 1. Check if package exists and is active
            const [pkg] = await db.select({ id: examPackages.id })
                .from(examPackages)
                .where(and(eq(examPackages.id, packageId), eq(examPackages.isActive, true)))
                .limit(1);

            if (!pkg) {
                return reply.notFound(request.i18n.t('exam.packages.update.notFound'));
            }

            // 2. Create the session
            const [newSession] = await db.insert(examSessions).values({
                userId,
                packageId,
                status: EnumExamSessionStatus.IN_PROGRESS,
            }).returning({ id: examSessions.id });

            // 3. Fetch questions belonging to this package
            const questions = await db.select({
                questionId: examPackageQuestions.questionId,
                order: examPackageQuestions.order,
            })
                .from(examPackageQuestions)
                .where(eq(examPackageQuestions.packageId, packageId))
                .orderBy(examPackageQuestions.order);

            // 4. Pre-populate exam_session_answers
            if (questions.length > 0) {
                const answerValues = questions.map(q => ({
                    sessionId: newSession.id,
                    questionId: q.questionId,
                    questionOrder: q.order,
                    isDoubtful: false,
                }));

                await db.insert(examSessionAnswers).values(answerValues);
            }

            return reply.status(201).send({
                success: true,
                message: request.i18n.t('exam.sessions.start.success'),
                data: {
                    sessionId: newSession.id,
                },
            });
        }),
    });
};

export default startSessionRoute;
