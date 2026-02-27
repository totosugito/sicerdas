import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { educationGrades } from '../../../db/schema/education-grade/education.ts';
import { eq, and, ne } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const UpdateEducationGradeParams = Type.Object({
    id: Type.Number()
});

const UpdateEducationGradeBody = Type.Object({
    name: Type.Optional(Type.String({ minLength: 1, maxLength: 128 })),
    desc: Type.Optional(Type.String()),
    extra: Type.Optional(Type.Any()),
});

const EducationGradeResponseItem = Type.Object({
    id: Type.Number(),
    grade: Type.String(),
    name: Type.String(),
    desc: Type.Union([Type.String(), Type.Null()]),
    extra: Type.Any(),
    createdAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    updatedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
});

const UpdateEducationGradeResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: EducationGradeResponseItem,
});

const updateEducationGradeRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/update/:id',
        method: 'PUT',
        schema: {
            tags: ['Admin Education Grades'],
            params: UpdateEducationGradeParams,
            body: UpdateEducationGradeBody,
            response: {
                200: UpdateEducationGradeResponse,
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
            request: FastifyRequest<{ Params: typeof UpdateEducationGradeParams.static, Body: typeof UpdateEducationGradeBody.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const { name, desc, extra } = request.body;

            // Ensure grade exists
            const existingGradeDetail = await db.query.educationGrades.findFirst({
                where: eq(educationGrades.id, id)
            });

            if (!existingGradeDetail) {
                return reply.notFound(request.i18n.t('educationGrade.update.notFound'));
            }

            // Check if new name conflicts with another existing grade
            if (name) {
                const nameConflict = await db.query.educationGrades.findFirst({
                    where: and(
                        eq(educationGrades.name, name),
                        ne(educationGrades.id, id)
                    )
                });

                if (nameConflict) {
                    return reply.badRequest(request.i18n.t('educationGrade.update.exists'));
                }
            }

            const updatePayload: any = {
                updatedAt: new Date()
            };

            if (name !== undefined) updatePayload.name = name;
            if (desc !== undefined) updatePayload.desc = desc;
            if (extra !== undefined) updatePayload.extra = extra;

            const [updatedGrade] = await db.update(educationGrades)
                .set(updatePayload)
                .where(eq(educationGrades.id, id))
                .returning();

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('educationGrade.update.success'),
                data: {
                    ...updatedGrade,
                    createdAt: updatedGrade.createdAt ? updatedGrade.createdAt.toISOString() : null,
                    updatedAt: updatedGrade.updatedAt ? updatedGrade.updatedAt.toISOString() : null,
                }
            });
        }),
    });
};

export default updateEducationGradeRoute;
