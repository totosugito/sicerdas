import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { db } from "../../../../db/index.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { bookCategory, bookStats, EnumBookStats } from "../../../../db/schema/index.ts";
import { Type } from "@sinclair/typebox";
import { sql, asc, desc, eq, and, or, ilike } from "drizzle-orm";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/list',
    method: 'GET',
    schema: {
      tags: ['Admin/Book/Category'],
      summary: '',
      description: 'Get list of book categories with pagination and sorting',
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
        sort: Type.Optional(Type.String({
          enum: ['name', 'total'],
          default: 'name'
        })),
        order: Type.Optional(Type.String({
          enum: ['asc', 'desc'],
          default: 'asc'
        })),
        search: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Array(Type.Object({
            id: Type.Number(),
            versionId: Type.Number(),
            name: Type.String(),
            desc: Type.Optional(Type.String()),
            total: Type.Number(),
            status: Type.String(),
            createdAt: Type.String({ format: 'date-time' }),
            updatedAt: Type.String({ format: 'date-time' })
          })),
          meta: Type.Object({
            total: Type.Number(),
            page: Type.Number(),
            limit: Type.Number(),
            totalPages: Type.Number()
          })
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        500: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        })
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      const {
        page = 1,
        limit = 10,
        sort = 'name',
        order = 'asc',
        search
      } = req.query as {
        page?: number;
        limit?: number;
        sort?: 'name' | 'total';
        order?: 'asc' | 'desc';
        search?: string;
      };

      // Create sort expression
      const orderBy = order === 'asc' ? asc : desc;
      const sortColumn = sort === 'total' ? bookStats.total : bookCategory.name;

      // Build base query for data
      const query = db
        .select({
          id: bookCategory.id,
          versionId: bookCategory.versionId,
          name: bookCategory.name,
          desc: bookCategory.desc,
          total: bookStats.total,
          status: bookCategory.status,
          createdAt: bookCategory.createdAt,
          updatedAt: bookCategory.updatedAt,
        })
        .from(bookCategory)
        .leftJoin(
          bookStats,
          and(
            eq(bookCategory.id, bookStats.referenceId),
            eq(bookStats.type, EnumBookStats.category)
          )
        )
        .$dynamic();

      // Build count query
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(bookCategory)
        .$dynamic();

      // Add search condition if search term is provided and not empty
      if (search && search.trim() !== '') {
        const searchTerm = `%${search}%`;
        const searchCondition = or(
          ilike(bookCategory.name, searchTerm),
          ilike(bookCategory.desc, searchTerm)
        );

        query.where(searchCondition);
        countQuery.where(searchCondition);
      }

      // Apply sorting and pagination
      query
        .orderBy(orderBy(sortColumn))
        .limit(limit)
        .offset((page - 1) * limit);

      // Execute queries in parallel
      const [data, totalResult] = await Promise.all([
        query,
        countQuery
      ]);

      const total = Number(totalResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      return reply.status(200).send({
        success: true,
        data: data.map(item => ({
          ...item,
          total: item.total || 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        })),
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    }, 422),
  });
};

export default protectedRoute;
