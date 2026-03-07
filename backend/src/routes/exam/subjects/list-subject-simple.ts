import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { examSubjects } from '../../../db/schema/exam/subjects.ts';
import { and, eq, asc, sql, ilike } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const SubjectSimpleQuery = Type.Object({
    search: Type.Optional(Type.String()),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const SubjectSimpleResponseItem = Type.Object({
    value: Type.String({ format: 'uuid' }),
    label: Type.String(),
});

const ListSubjectsSimpleResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(SubjectSimpleResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listSubjectsSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list-simple',
        method: 'POST',
        schema: {
            tags: ['Exam Subjects'],
            body: SubjectSimpleQuery,
            response: {
                200: ListSubjectsSimpleResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof SubjectSimpleQuery.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { search, page = 1, limit = 1000 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [eq(examSubjects.isActive, true)];

            if (search && search.trim() !== '') {
                conditions.push(ilike(examSubjects.name, `%${search.trim().toLowerCase()}%`));
            }

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(examSubjects)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await db.select({
                value: examSubjects.id,
                label: examSubjects.name,
            })
                .from(examSubjects)
                .where(and(...conditions))
                .orderBy(asc(examSubjects.name))
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: t($ => $.exam.subjects.list.success),
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

export default listSubjectsSimpleRoute;
