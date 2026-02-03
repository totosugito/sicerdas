import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { aiModels } from "../../../db/schema/chat-ai-schema.ts";
import { ilike, or, and, sql, eq, desc } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const ModelResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    provider: Type.String(),
    modelIdentifier: Type.String(),
    description: Type.Optional(Type.String()),
    status: Type.String(),
    isDefault: Type.Boolean(),
    isEnabled: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const ModelListQuery = Type.Object({
    search: Type.Optional(Type.String()),
    provider: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    isEnabled: Type.Optional(Type.Boolean()),
    page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
    limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
    sortBy: Type.Optional(Type.String({ default: 'updatedAt' })),
    sortOrder: Type.Optional(Type.String({ default: 'desc' })),
});

const ListModelsResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Object({
        items: Type.Array(ModelResponseItem),
        total: Type.Number(),
        page: Type.Number(),
        limit: Type.Number(),
        totalPages: Type.Number(),
    }),
});

const listModelsRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/models/list',
        method: 'POST',
        schema: {
            tags: ['Admin/ChatAI'],
            summary: 'List AI models',
            description: 'Get a paginated list of AI models with filtering',
            body: ModelListQuery,
            response: {
                200: ListModelsResponse,
                '4xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                }),
                '5xx': Type.Object({
                    success: Type.Boolean({ default: false }),
                    message: Type.String()
                })
            },
        },
        handler: withErrorHandler(async function handler(
            req: FastifyRequest<{ Body: typeof ModelListQuery.static }>,
            reply: FastifyReply
        ): Promise<typeof ListModelsResponse.static> {
            const {
                search,
                provider,
                status,
                isEnabled,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.body;

            const offset = (page - 1) * limit;

            const conditions = [];

            if (search && search.trim() !== '') {
                const searchTerm = `%${search.trim().toLowerCase()}%`;
                conditions.push(or(
                    ilike(aiModels.name, searchTerm),
                    ilike(aiModels.modelIdentifier, searchTerm),
                    ilike(aiModels.provider, searchTerm)
                ));
            }

            if (provider) {
                conditions.push(ilike(aiModels.provider, provider));
            }

            // enum validation might be needed but assuming strict schema or loose match
            if (status) {
                conditions.push(eq(aiModels.status, status));
            }

            if (isEnabled !== undefined) {
                conditions.push(eq(aiModels.isEnabled, isEnabled));
            }

            let baseQuery = db.select().from(aiModels);

            if (conditions.length > 0) {
                baseQuery = baseQuery.where(and(...conditions)) as any;
            }

            // Sorting
            const order = sortOrder === 'asc' ? 'asc' : 'desc';
            let sortCol;
            switch (sortBy) {
                case 'name': sortCol = aiModels.name; break;
                case 'provider': sortCol = aiModels.provider; break;
                case 'status': sortCol = aiModels.status; break;
                case 'createdAt': sortCol = aiModels.createdAt; break;
                case 'updatedAt': sortCol = aiModels.updatedAt; break;
                default: sortCol = aiModels.createdAt;
            }

            const query = order === 'asc'
                ? baseQuery.orderBy(sortCol)
                : baseQuery.orderBy(desc(sortCol));

            // Count
            // We need to re-construct query for count or use a subquery approach
            // Using a simpler approach for count by cloning logic
            const countResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(aiModels)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);
            const totalPages = Math.ceil(total / limit);

            const items = await query.limit(limit).offset(offset);

            return reply.send({
                success: true,
                message: req.i18n.t('admin.model.list.success'),
                data: {
                    items: items.map(m => ({
                        ...m,
                        description: m.description || undefined,
                        createdAt: m.createdAt.toISOString(),
                        updatedAt: m.updatedAt.toISOString(),
                    })),
                    total,
                    page,
                    limit,
                    totalPages
                }
            });
        }),
    });
};

export default listModelsRoute;
