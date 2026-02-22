import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackageSections } from '../../../../db/schema/exam/package-sections.ts';
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
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof DeleteSectionParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            const [existing] = await db.select({ id: examPackageSections.id })
                .from(examPackageSections)
                .where(eq(examPackageSections.id, id))
                .limit(1);

            if (!existing) {
                return reply.status(404).send({
                    success: false,
                    message: request.i18n.t('exam.package-sections.delete.notFound'),
                });
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
