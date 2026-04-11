import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { desc, ilike, and, sql, eq, getTableColumns } from "drizzle-orm";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const PassageListQuery = Type.Object({
  search: Type.Optional(Type.String({ description: "Search term for passage title" })),
  isActive: Type.Optional(Type.Boolean({ description: "Filter by active status" })),

  sortBy: Type.Optional(
    Type.String({ description: "Sort field: createdAt, title, updatedAt", default: "updatedAt" }),
  ),
  sortOrder: Type.Optional(
    Type.String({ description: "Sort order: 'asc' or 'desc'", default: "desc" }),
  ),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
  subjectId: Type.Optional(Type.String({ format: "uuid", description: "Filter by subject ID" })),
});

const PassageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.Union([Type.String(), Type.Null()]),
  content: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  isActive: Type.Boolean(),
  totalQuestions: Type.Number(),
  activeQuestions: Type.Number(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  subjectId: Type.String({ format: "uuid" }),
  subjectName: Type.String(),
});

const ListPassagesResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(PassageResponseItem),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const listPassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Passages"],
      body: PassageListQuery,
      response: {
        200: ListPassagesResponse,
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
      request: FastifyRequest<{ Body: typeof PassageListQuery.static }>,
      reply: FastifyReply,
    ) {
      const { t } = getTypedI18n(request);
      const {
        search,
        isActive,
        sortBy = "updatedAt",
        sortOrder = "desc",
        page = 1,
        limit = 10,
        subjectId,
      } = request.body;

      const offset = (page - 1) * limit;

      const conditions = [];

      if (isActive !== undefined) conditions.push(eq(examPassages.isActive, isActive));
      if (subjectId !== undefined) conditions.push(eq(examPassages.subjectId, subjectId));

      if (search && search.trim() !== "") {
        const searchTerm = `%${search.trim().toLowerCase()}%`;
        conditions.push(ilike(examPassages.title, searchTerm));
      }

      // Build Query
      let baseQuery = db
        .select({
          ...getTableColumns(examPassages),
          subjectName: examSubjects.name,
        })
        .from(examPassages)
        .leftJoin(examSubjects, eq(examPassages.subjectId, examSubjects.id));

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions)) as any;
      }

      // Add Sorting
      const orderDir = sortOrder === "asc" ? "asc" : "desc";
      let queryWithSort;

      switch (sortBy) {
        case "title":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(examPassages.title)
              : baseQuery.orderBy(desc(examPassages.title));
          break;
        case "updatedAt":
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(examPassages.updatedAt)
              : baseQuery.orderBy(desc(examPassages.updatedAt));
          break;
        case "createdAt":
        default:
          queryWithSort =
            orderDir === "asc"
              ? baseQuery.orderBy(examPassages.createdAt)
              : baseQuery.orderBy(desc(examPassages.createdAt));
          break;
      }

      // Meta calculations
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(queryWithSort.as("subquery"));

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // Execute Paginated Fetch
      const items = await queryWithSort.limit(limit).offset(offset);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.passages.list.success),
        data: {
          items: items.map((p) => ({
            id: p.id,
            title: p.title,
            content: p.content as Record<string, unknown>[],
            isActive: p.isActive,
            totalQuestions: p.totalQuestions,
            activeQuestions: p.activeQuestions,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
            subjectId: p.subjectId,
            subjectName: p.subjectName || "",
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

export default listPassageRoute;
