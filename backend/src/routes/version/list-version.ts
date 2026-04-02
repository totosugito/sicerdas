import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { appVersion } from "../../db/schema/app/app-version.ts";
import { db } from "../../db/db-pool.ts";
import { and, desc, asc, sql, ilike, eq } from "drizzle-orm";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { EnumContentType, EnumContentStatus } from "../../db/schema/enum/enum-app.ts";

const ListVersionBody = Type.Object({
  page: Type.Optional(Type.Number({ default: 1 })),
  limit: Type.Optional(Type.Number({ default: 10 })),
  search: Type.Optional(Type.String()),
  dataType: Type.Optional(Type.Enum(EnumContentType)),
  status: Type.Optional(Type.Enum(EnumContentStatus)),
  sortBy: Type.Optional(Type.String({ default: "createdAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
});

const VersionResponseItem = Type.Object({
  id: Type.Number(),
  appVersion: Type.Number(),
  dbVersion: Type.Number(),
  dataType: Type.String(),
  status: Type.String(),
  name: Type.String(),
  note: Type.Optional(Type.String()),
  extra: Type.Record(Type.String(), Type.Unknown()),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const ListVersionResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(VersionResponseItem),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const listVersionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Version"],
      body: ListVersionBody,
      response: {
        200: ListVersionResponse,
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
      request: FastifyRequest<{ Body: typeof ListVersionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListVersionResponse.static> {
      const { t } = getTypedI18n(request);
      const {
        page = 1,
        limit = 10,
        search,
        dataType,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = request.body;

      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(ilike(appVersion.name, `%${search}%`));
      }
      if (dataType) {
        conditions.push(eq(appVersion.dataType, dataType));
      }
      if (status) {
        conditions.push(eq(appVersion.status, status));
      }

      const baseQuery = db.select().from(appVersion);

      if (conditions.length > 0) {
        baseQuery.where(and(...conditions));
      }

      const order = sortOrder === "asc" ? asc : desc;
      let queryWithSort;

      switch (sortBy) {
        case "appVersion":
          queryWithSort = baseQuery.orderBy(order(appVersion.appVersion));
          break;
        case "dbVersion":
          queryWithSort = baseQuery.orderBy(order(appVersion.dbVersion));
          break;
        case "name":
          queryWithSort = baseQuery.orderBy(order(appVersion.name));
          break;
        case "status":
          queryWithSort = baseQuery.orderBy(order(appVersion.status));
          break;
        case "dataType":
          queryWithSort = baseQuery.orderBy(order(appVersion.dataType));
          break;
        case "updatedAt":
          queryWithSort = baseQuery.orderBy(order(appVersion.updatedAt));
          break;
        case "createdAt":
        default:
          queryWithSort = baseQuery.orderBy(order(appVersion.createdAt));
          break;
      }

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(queryWithSort.as("subquery"));

      const total = Number(countResult[0]?.count || 0);

      const items = await queryWithSort.limit(limit).offset(offset);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.version.listSuccess),
        data: {
          items: items.map((item) => ({
            ...item,
            note: item.note || "",
            extra: (item.extra as Record<string, unknown>) || {},
            createdAt: item.createdAt?.toISOString() || "",
            updatedAt: item.updatedAt?.toISOString() || "",
          })),
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }),
  });
};

export default listVersionRoute;
