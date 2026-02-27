import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { educationGrades } from '../../../db/schema/education-grade/education.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const DeleteEducationGradeParams = Type.Object({
    id: Type.Number()
});

const DeleteEducationGradeResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

const deleteEducationGradeRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/delete/:id',
        method: 'DELETE',
        schema: {
            tags: ['Education Grades'],
            params: DeleteEducationGradeParams,
            response: {
                200: DeleteEducationGradeResponse,
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
            request: FastifyRequest<{ Params: typeof DeleteEducationGradeParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            // Ensure grade exists
            const existingGrade = await db.query.educationGrades.findFirst({
                where: eq(educationGrades.id, id)
            });

            if (!existingGrade) {
                return reply.notFound(request.i18n.t('educationGrade.delete.notFound'));
            }

            // Perform Hard Delete
            await db.delete(educationGrades).where(eq(educationGrades.id, id));

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('educationGrade.delete.success'),
            });
        }),
    });
};

export default deleteEducationGradeRoute;
