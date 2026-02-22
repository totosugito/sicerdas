import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
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
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
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

            // NOTE: Deleting a package will cascade to package_sections and package_questions 
            // because of the references in those schemas (onDelete: 'cascade').
            await db.delete(examPackages).where(eq(examPackages.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.packages.delete.success'),
            });
        }),
    });
};

export default deletePackageRoute;
