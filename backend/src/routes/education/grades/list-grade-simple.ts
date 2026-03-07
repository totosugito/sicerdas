import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { educationGrades } from '../../../db/schema/education/grades.ts';
import { asc, sql } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const GradeSimpleQuery = Type.Object({
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const GradeSimpleResponseItem = Type.Object({
    value: Type.String(),
    label: Type.String(),
});

const ListGradesSimpleResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(GradeSimpleResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listGradesSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list-simple',
        method: 'POST',
        schema: {
            tags: ['Education Grades'],
            body: GradeSimpleQuery,
            response: {
                200: ListGradesSimpleResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof GradeSimpleQuery.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { page = 1, limit = 1000 } = request.body;
            const offset = (page - 1) * limit;

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(educationGrades);

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await db.select({
                value: sql<string>`${educationGrades.id}::text`,
                label: educationGrades.name,
            })
                .from(educationGrades)
                .orderBy(asc(educationGrades.name))
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: t($ => $.education.grades.list.success),
                data: {
                    items,
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

export default listGradesSimpleRoute;
