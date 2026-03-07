import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { educationGrades } from '../../../db/schema/education/grades.ts';
import { desc, ilike, or, and, sql, asc } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const EducationGradeListQuery = Type.Object({
    search: Type.Optional(Type.String({ description: 'Search term for grade name or desc' })),
    sortBy: Type.Optional(Type.String({ description: 'Sort field: createdAt, updatedAt, name, grade', default: 'updatedAt' })),
    sortOrder: Type.Optional(Type.String({ description: 'Sort order: asc or desc', default: 'desc' })),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 1000 })),
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

const ListEducationGradesResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(EducationGradeResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listEducationGradeRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list',
        method: 'POST',
        schema: {
            tags: ['Education Grades'],
            body: EducationGradeListQuery,
            response: {
                200: ListEducationGradesResponse,
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
            request: FastifyRequest<{ Body: typeof EducationGradeListQuery.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { search, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 10 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [];

            // Add search condition
            if (search && search.trim() !== '') {
                const searchTerm = `%${search.trim().toLowerCase()}%`;
                conditions.push(
                    or(
                        ilike(educationGrades.name, searchTerm),
                        ilike(educationGrades.desc, searchTerm),
                        ilike(educationGrades.grade, searchTerm)
                    )
                );
            }

            // Build Query
            let baseQuery = db.select().from(educationGrades);
            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Add Sorting
            const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';
            let queryWithSort;

            switch (sortBy) {
                case 'name':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationGrades.name)) : baseQuery.orderBy(desc(educationGrades.name));
                    break;
                case 'grade':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationGrades.grade)) : baseQuery.orderBy(desc(educationGrades.grade));
                    break;
                case 'updatedAt':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationGrades.updatedAt)) : baseQuery.orderBy(desc(educationGrades.updatedAt));
                    break;
                case 'createdAt':
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationGrades.createdAt)) : baseQuery.orderBy(desc(educationGrades.createdAt));
                    break;
                default:
                    queryWithSort = orderDir === 'asc' ? baseQuery.orderBy(asc(educationGrades.name)) : baseQuery.orderBy(desc(educationGrades.name));
                    break;
            }

            // Meta calculations
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(queryWithSort.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Execute Paginated Fetch
            const items = await queryWithSort
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: t($ => $.education.grades.list.success),
                data: {
                    items: items.map(grade => ({
                        ...grade,
                        createdAt: grade.createdAt ? grade.createdAt.toISOString() : null,
                        updatedAt: grade.updatedAt ? grade.updatedAt.toISOString() : null,
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

export default listEducationGradeRoute;
