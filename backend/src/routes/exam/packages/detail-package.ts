import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { examPackages } from '../../../db/schema/exam/packages.ts';
import { examCategories } from '../../../db/schema/exam/categories.ts';
import { educationGrades } from '../../../db/schema/education-grade/education.ts';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";

const DetailPackageParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const PackageResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    categoryId: Type.String({ format: 'uuid' }),
    title: Type.String(),
    examType: Type.String(),
    durationMinutes: Type.Number(),
    description: Type.Union([Type.String(), Type.Null()]),
    requiredTier: Type.Union([Type.String(), Type.Null()]),
    educationGradeId: Type.Union([Type.Number(), Type.Null()]),
    categoryName: Type.Union([Type.String(), Type.Null()]),
    educationGradeName: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const DetailPackageResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: PackageResponseItem,
});

const detailPackageRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/detail/:id',
        method: 'GET',
        schema: {
            tags: ['Exam Packages'],
            params: DetailPackageParams,
            response: {
                200: DetailPackageResponse,
                404: Type.Object({ success: Type.Boolean(), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof DetailPackageParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            const [result] = await db.select({
                package: examPackages,
                categoryName: examCategories.name,
                educationGradeName: educationGrades.name,
            })
                .from(examPackages)
                .leftJoin(examCategories, eq(examPackages.categoryId, examCategories.id))
                .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
                .where(eq(examPackages.id, id))
                .limit(1);

            if (!result) {
                return reply.status(404).send({
                    success: false,
                    message: request.i18n.t('exam.packages.detail.notFound'),
                });
            }

            const pkg = result.package;

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.packages.detail.success'),
                data: {
                    ...pkg,
                    categoryName: result.categoryName,
                    educationGradeName: result.educationGradeName,
                    createdAt: pkg.createdAt.toISOString(),
                    updatedAt: pkg.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default detailPackageRoute;
