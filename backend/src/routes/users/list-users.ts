import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users, usersProfile, EnumUserRole } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { and, asc, desc, eq, ilike, or, sql, inArray } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserAvatarUrl } from "../../utils/user-utils.ts";

const ListBody = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: Type.Optional(Type.String({ description: "Search term for name or email" })),
  roles: Type.Optional(
    Type.Array(Type.Enum(EnumUserRole), { description: "Filter by multiple user roles" }),
  ),
  sortBy: Type.Optional(
    Type.String({
      default: "createdAt",
      description: "Sort field: createdAt, name, email, role, updatedAt",
    }),
  ),
  sortOrder: Type.Optional(
    Type.String({ description: "Sort order: asc or desc", default: "desc" }),
  ),
});

const UserResponseItem = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.String(),
  role: Type.String(),
  image: Type.Union([Type.String(), Type.Null()]),
  banned: Type.Union([Type.Boolean(), Type.Null()]),
  school: Type.Union([Type.String(), Type.Null()]),
  grade: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const ListResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
  data: Type.Object({
    items: Type.Array(UserResponseItem),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const listUsers: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "List users with pagination, search, and filtering",
      body: ListBody,
      response: {
        200: ListResponse,
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
      req: FastifyRequest<{ Body: typeof ListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ListResponse.static> {
      const { t } = getTypedI18n(req);
      const {
        page = 1,
        limit = 10,
        search,
        roles,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.body;

      const offset = (page - 1) * limit;

      const conditions = [];

      if (search && search.trim() !== "") {
        const searchTerm = `%${search.trim().toLowerCase()}%`;
        conditions.push(or(ilike(users.name, searchTerm), ilike(users.email, searchTerm)));
      }

      if (roles && roles.length > 0) {
        conditions.push(inArray(users.role, roles));
      }

      // Build base query
      const baseQuery = db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          image: users.image,
          banned: users.banned,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          school: usersProfile.school,
          grade: usersProfile.grade,
        })
        .from(users)
        .leftJoin(usersProfile, eq(users.id, usersProfile.id));

      const queryWithWhere = baseQuery.where(
        conditions.length > 0 ? and(...conditions) : undefined,
      );

      // Sorting
      const order = sortOrder === "asc" ? asc : desc;
      let query;

      switch (sortBy) {
        case "name":
          query = queryWithWhere.orderBy(order(users.name));
          break;
        case "email":
          query = queryWithWhere.orderBy(order(users.email));
          break;
        case "role":
          query = queryWithWhere.orderBy(order(users.role));
          break;
        case "updatedAt":
          query = queryWithWhere.orderBy(order(users.updatedAt));
          break;
        case "createdAt":
        default:
          query = queryWithWhere.orderBy(order(users.createdAt));
          break;
      }

      // Count result
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(query.as("subquery"));

      const totalItems = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(totalItems / limit);

      // Fetch items
      const items = await query.limit(limit).offset(offset);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.user.management.list.success),
        data: {
          items: items.map((item) => ({
            ...item,
            image: getUserAvatarUrl(item.id, item.image),
            createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: item.updatedAt ? item.updatedAt.toISOString() : new Date().toISOString(),
          })),
          meta: {
            total: totalItems,
            page,
            limit,
            totalPages,
          },
        },
      });
    }),
  });
};

export default listUsers;
