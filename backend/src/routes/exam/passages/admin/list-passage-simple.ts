import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../../db/db-pool.ts';
import { examPassages } from '../../../../db/schema/exam/passages.ts';
import { and, eq, asc, sql, ilike } from 'drizzle-orm';
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";

const PassageSimpleQuery = Type.Object({
    subjectId: Type.Optional(Type.String({ format: 'uuid' })),
    search: Type.Optional(Type.String()),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const PassageSimpleResponseItem = Type.Object({
    value: Type.String({ format: 'uuid' }),
    label: Type.String(),
});

const ListPassagesSimpleResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(PassageSimpleResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listPassagesSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list-simple',
        method: 'POST',
        schema: {
            tags: ['Admin Exam Passages'],
            body: PassageSimpleQuery,
            response: {
                200: ListPassagesSimpleResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof PassageSimpleQuery.static }>,
            reply: FastifyReply
        ) {
            const { subjectId, search, page = 1, limit = 1000 } = request.body;
            const offset = (page - 1) * limit;

            const conditions = [eq(examPassages.isActive, true)];
            if (subjectId) {
                conditions.push(eq(examPassages.subjectId, subjectId));
            }
            if (search && search.trim() !== '') {
                conditions.push(ilike(examPassages.title, `%${search.trim()}%`));
            }

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(examPassages)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await db.select({
                value: examPassages.id,
                label: sql<string>`COALESCE(${examPassages.title}, 'No Title')`,
            })
                .from(examPassages)
                .where(and(...conditions))
                .orderBy(asc(examPassages.title))
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('exam.passages.list.success'),
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

export default listPassagesSimpleRoute;
