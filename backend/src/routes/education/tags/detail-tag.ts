import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { db } from '../../../db/db-pool.ts';
import { educationTags } from '../../../db/schema/education/tags.ts';
import { examQuestionTags } from '../../../db/schema/exam/question-tags.ts';
import { eq, and, count, getTableColumns } from 'drizzle-orm';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { fromNodeHeaders } from 'better-auth/node';
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumUserRole } from '../../../db/schema/index.ts';

const DetailTagParams = Type.Object({
    id: Type.String({ format: 'uuid' }),
});

const TagResponseItem = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
    totalQuestions: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});

const DetailTagResponse = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: TagResponseItem,
});

const detailTagRoute: FastifyPluginAsyncTypebox = async (app) => {
    app.route({
        url: '/detail/:id',
        method: 'GET',
        schema: {
            tags: ['Exam Tags'],
            params: DetailTagParams,
            response: {
                200: DetailTagResponse,
                '4xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
                '5xx': Type.Object({ success: Type.Boolean({ default: false }), message: Type.String() }),
            }
        },
        handler: withErrorHandler(async function handler(
            request: FastifyRequest<{ Params: typeof DetailTagParams.static }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;

            // Determine user role from session
            const session = await getAuthInstance(app).api.getSession({
                headers: fromNodeHeaders(request.headers),
            });
            const user = session?.user;
            const isAdmin = user?.role === EnumUserRole.ADMIN;

            const conditions = [eq(educationTags.id, id)];

            if (!isAdmin) {
                // Regular users can only see active tags
                conditions.push(eq(educationTags.isActive, true));
            }

            const [result] = await db.select({
                ...getTableColumns(educationTags),
                totalQuestions: count(examQuestionTags.questionId).mapWith(Number)
            })
                .from(educationTags)
                .leftJoin(examQuestionTags, eq(educationTags.id, examQuestionTags.tagId))
                .where(and(...conditions))
                .groupBy(educationTags.id)
                .limit(1);

            if (!result) {
                return reply.notFound(request.i18n.t('education.tags.detail.notFound'));
            }

            return reply.status(200).send({
                success: true,
                message: request.i18n.t('education.tags.detail.success'),
                data: {
                    ...result,
                    createdAt: result.createdAt.toISOString(),
                    updatedAt: result.updatedAt.toISOString(),
                }
            });
        }),
    });
};

export default detailTagRoute;
