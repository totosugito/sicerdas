import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackageQuestions } from '../../../../db/schema/exam/package-questions.ts';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { and, eq, inArray } from 'drizzle-orm';

const AssignPackageQuestionsBody = Type.Object({
    packageId: Type.String({ format: 'uuid' }),
    sectionId: Type.Optional(Type.String({ format: 'uuid' })),
    questions: Type.Array(Type.Object({
        questionId: Type.String({ format: 'uuid' }),
        order: Type.Number(),
    }), { minItems: 1 })
});

const AssignPackageQuestionsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const assignPackageQuestionsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/assign',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Package Questions'],
            body: AssignPackageQuestionsBody,
            response: {
                200: AssignPackageQuestionsResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof AssignPackageQuestionsBody.static }>,
            reply: FastifyReply
        ) {
            const { packageId, sectionId, questions } = request.body;

            // Simple bulk logic:
            // 1. First cleanup existing assignments for these questions in this package if they exist
            // (Or just use onConflictDoUpdate)

            const questionIds = questions.map(q => q.questionId);

            // We use simple delete and re-insert approach for clean sync
            await db.delete(examPackageQuestions)
                .where(
                    and(
                        eq(examPackageQuestions.packageId, packageId),
                        inArray(examPackageQuestions.questionId, questionIds)
                    )
                );

            const values = questions.map(q => ({
                packageId,
                sectionId,
                questionId: q.questionId,
                order: q.order,
            }));

            await db.insert(examPackageQuestions).values(values);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.package-questions.assign.success'),
            });
        }),
    });
};

export default assignPackageQuestionsRoute;
