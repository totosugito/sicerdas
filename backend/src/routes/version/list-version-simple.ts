import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { appVersion } from "../../db/schema/app/app-version.ts";
import { and, eq, asc, sql, ilike } from "drizzle-orm";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { EnumContentStatus, EnumContentType } from "../../db/schema/enum/enum-app.ts";

const VersionSimpleQuery = Type.Object({
  dataType: Type.Enum(EnumContentType),
  search: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 1000, minimum: 1, maximum: 2000 })),
});

const VersionSimpleResponseItem = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  published: Type.Boolean(),
});

const ListVersionSimpleResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(VersionSimpleResponseItem),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const listVersionSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Version"],
      body: VersionSimpleQuery,
      response: {
        200: ListVersionSimpleResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      request: FastifyRequest<{ Body: typeof VersionSimpleQuery.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListVersionSimpleResponse.static> {
      const { t } = getTypedI18n(request);
      const { dataType, search, page = 1, limit = 1000 } = request.body;
      const offset = (page - 1) * limit;

      const conditions = [
        eq(appVersion.dataType, dataType),
        // eq(appVersion.status, EnumContentStatus.PUBLISHED),
      ];

      if (search && search.trim() !== "") {
        conditions.push(ilike(appVersion.name, `%${search.trim()}%`));
      }

      // Count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(appVersion)
        .where(and(...conditions));

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // Fetch
      const items = await db
        .select({
          id: appVersion.id,
          name: appVersion.name,
          status: appVersion.status,
        })
        .from(appVersion)
        .where(and(...conditions))
        .orderBy(asc(appVersion.name))
        .limit(limit)
        .offset(offset);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.version.listSuccess),
        data: {
          items: items.map((item) => ({
            id: item.id,
            name: item.name || "",
            published: item.status === EnumContentStatus.PUBLISHED,
          })),
          meta: {
            total,
            page,
            limit,
            totalPages,
          },
        },
      });
    }),
  });
};

export default listVersionSimpleRoute;
