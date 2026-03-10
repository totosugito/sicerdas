import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { educationTags } from '../../../db/schema/education/tags.ts';
import { asc, sql, eq } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const TagSimpleQuery = Type.Object({
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const TagSimpleResponseItem = Type.Object({
    value: Type.String(),
    label: Type.String(),
});

const ListTagsSimpleResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(TagSimpleResponseItem),
        meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number(),
        })
    }),
});

const listTagsSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/list-simple',
        method: 'POST',
        schema: {
            tags: ['Education Tags'],
            body: TagSimpleQuery,
            response: {
                200: ListTagsSimpleResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Body: typeof TagSimpleQuery.static }>,
            reply: FastifyReply
        ) {
            const { t } = getTypedI18n(request);
            const { page = 1, limit = 1000 } = request.body;
            const offset = (page - 1) * limit;

            // Only list active tags for simple selection
            const baseQuery = db
                .select()
                .from(educationTags)
                .where(eq(educationTags.isActive, true));

            // Count
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(baseQuery.as('subquery'));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            // Fetch
            const items = await db.select({
                value: sql<string>`${educationTags.id}::text`,
                label: educationTags.name,
            })
                .from(educationTags)
                .where(eq(educationTags.isActive, true))
                .orderBy(asc(educationTags.name))
                .limit(limit)
                .offset(offset);

            return reply.status(200).send({
                success: true,
                message: t($ => $.education.tags.list.success),
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

export default listTagsSimpleRoute;
