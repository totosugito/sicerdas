import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPackages } from '../../../../db/schema/exam/packages.ts';
import { desc, ilike, and, sql, eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const PackageListQuery = Type.Object({
    search: Type.Optional(Type.String({ description: 'Search term for package title' })),
    categoryId: Type.Optional(Type.String({ format: 'uuid' })),
    examType: Type.Optional(Type.String()),
    isActive: Type.Optional(Type.Boolean()),
    educationGradeId: Type.Optional(Type.Number()),

    sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt, title, isActive, updatedAt, durationMinutes, categoryId, examType, educationGradeId', default: 'createdAt' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'desc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
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
    isActive: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ListPackagesResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(PackageResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listPackagesRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Packages'],
            body: PackageListQuery,
            response: {
                200: ListPackagesResponse,
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof PackageListQuery.static }>,
            reply: FastifyReply
        ) {
            const {
                search, categoryId, examType, isActive, educationGradeId,
                sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10
            } = request.body;

            const offset = (page - 1) * limit;
            const conditions = [];

            if (isActive !== undefined) conditions.push(eq(examPackages.isActive, isActive));
            if (categoryId) conditions.push(eq(examPackages.categoryId, categoryId));
            if (examType) conditions.push(eq(examPackages.examType, examType as any));
            if (educationGradeId) conditions.push(eq(examPackages.educationGradeId, educationGradeId));

            if (search && search.trim() !== '') {
                const searchTerm = `%${search.trim().toLowerCase()}%`;
                conditions.push(ilike(examPackages.title, searchTerm));
            }

            // Build Query
            let baseQuery = db.select().from(examPackages);
            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Sorting
            const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'title':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackages.title) : baseQuery.orderBy(desc(examPackages.title));
                    break;
                case 'isActive':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackages.isActive) : baseQuery.orderBy(desc(examPackages.isActive));
                    break;
                case 'updatedAt':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackages.updatedAt) : baseQuery.orderBy(desc(examPackages.updatedAt));
                    break;
                case 'durationMinutes':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackages.durationMinutes) : baseQuery.orderBy(desc(examPackages.durationMinutes));
                    break;
                case 'categoryId':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackages.categoryId) : baseQuery.orderBy(desc(examPackages.categoryId));
                    break;
                case 'examType':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackages.examType) : baseQuery.orderBy(desc(examPackages.examType));
                    break;
                case 'educationGradeId':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackages.educationGradeId) : baseQuery.orderBy(desc(examPackages.educationGradeId));
                    break;
                case 'createdAt':
                default:
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(examPackages.createdAt) : baseQuery.orderBy(desc(examPackages.createdAt));
                    break;
            }

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(queryWithSort.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await queryWithSort.limit(limit).offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.packages.list.success'),
                data: {
                    items: items.map(p => ({
                        ...p,
                        createdAt: p.createdAt.toISOString(),
                        updatedAt: p.updatedAt.toISOString(),
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

export default listPackagesRoute;
