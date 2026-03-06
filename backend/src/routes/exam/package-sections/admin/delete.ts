import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackageSections } from '../../../../db/schema/exam/package-sections.ts';
import { examPackageQuestions } from '../../../../db/schema/exam/package-questions.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const DeleteSectionParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const DeleteSectionResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Admin Exam Package Sections'],
            params: DeleteSectionParams,
            response: {
                200: DeleteSectionResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof DeleteSectionParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            const existing = await db.query.examPackageSections.findFirst({
                where: eq(examPackageSections.id, id)
            });

            if (!existing) {
                return reply.notFound(request.i18n.t('exam.package-sections.delete.notFound'));
            }

            // Check if section is in use by any questions
            const inUseCheck = await db.query.examPackageQuestions.findFirst({
                where: eq(examPackageQuestions.sectionId, id)
            });

            if (inUseCheck) {
                return reply.badRequest(request.i18n.t('exam.package-sections.delete.inUse'));
            }

            await db.delete(examPackageSections).where(eq(examPackageSections.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.package-sections.delete.success'),
            });
        }),
    });
};

export default deleteSectionRoute;
