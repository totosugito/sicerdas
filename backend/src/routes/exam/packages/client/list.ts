import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { examPackageQuestions } from '../../../../db/schema/exam/package-questions.ts';
import { desc, and, sql, eq, count, getTableColumns } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const PackageClientListQuery = Type.Object({
    categoryId: Type.Optional(Type.String({ format: 'uuid' })),
    educationGradeId: Type.Optional(Type.Number()),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const PackageClientResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    categoryId: Type.String({ format: 'uuid' }),
    title: Type.String(),
    examType: Type.String(),
    durationMinutes: Type.Number(),
    description: Type.Union([Type.String(), Type.Null()]),
    requiredTier: Type.Union([Type.String(), Type.Null()]),
    educationGradeId: Type.Union([Type.Number(), Type.Null()]),
    totalQuestions: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
});

const ListPackagesClientResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(PackageClientResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listPackagesClientRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Client Exam Packages'],
            body: PackageClientListQuery,
            response: {
                200: ListPackagesClientResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof PackageClientListQuery.static }>,
            reply: FastifyReply
        ) {
            const { categoryId, educationGradeId, page = 1, limit = 10 } = request.body;
            const offset = (page - 1) * limit;

            // Client should only see active packages
            const conditions = [eq(examPackages.isActive, true)];
            if (categoryId) conditions.push(eq(examPackages.categoryId, categoryId));
            if (educationGradeId) conditions.push(eq(examPackages.educationGradeId, educationGradeId));

            // Base query with count join
            const baseQuery = db.select({
                ...getTableColumns(examPackages),
                totalQuestions: count(examPackageQuestions.questionId).mapWith(Number)
            })
                .from(examPackages)
                .leftJoin(examPackageQuestions, eq(examPackages.id, examPackageQuestions.packageId))
                .where(and(...conditions))
                .groupBy(examPackages.id)
                .orderBy(desc(examPackages.createdAt));

            // Count total items for pagination
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(baseQuery.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch paginated items
            const items = await baseQuery.limit(limit).offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.packages.list.success'),
                data: {
                    items: items.map(p => ({
                        ...p,
                        createdAt: p.createdAt.toISOString(),
                    })),
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages,
                    }
                }
            });
        }),
    });
};

export default listPackagesClientRoute;
