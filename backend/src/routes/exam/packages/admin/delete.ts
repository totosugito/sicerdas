import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { examSessions } from '../../../../db/schema/exam/sessions.ts';
import { examPackageSections } from '../../../../db/schema/exam/package-sections.ts';
import { examPackageQuestions } from '../../../../db/schema/exam/package-questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const DeletePackageParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const DeletePackageResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deletePackageRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin Exam Packages'],
            params: DeletePackageParams,
            response: {
                200: DeletePackageResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof DeletePackageParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            const [existing] = await db.select({ id: examPackages.id })
                .from(examPackages)
                .where(eq(examPackages.id, id))
                .limit(1);

            if (!existing) {
                return reply.status(404).send({
                    success: false,
                    message: request.i18n.t('exam.packages.delete.notFound'),
                });
            }

            // Check if package is in use by any sessions
            const inUseCheck = await db.query.examSessions.findFirst({
                where: eq(examSessions.packageId, id)
            });

            if (inUseCheck) {
                return reply.badRequest(request.i18n.t('exam.packages.delete.inUse'));
            }

            // Check if package has sections or question assignments
            const [hasContent] = await Promise.all([
                db.query.examPackageSections.findFirst({ where: eq(examPackageSections.packageId, id) }),
                db.query.examPackageQuestions.findFirst({ where: eq(examPackageQuestions.packageId, id) }),
            ]);

            if (hasContent) {
                return reply.badRequest(request.i18n.t('exam.packages.delete.hasContent'));
            }

            // Perform Hard Delete
            await db.delete(examPackages).where(eq(examPackages.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.packages.delete.success'),
            });
        }),
    });
};

export default deletePackageRoute;
