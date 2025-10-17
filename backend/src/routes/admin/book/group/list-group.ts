import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { db } from "../../../../db/index.ts";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { bookGroup, bookCategory, bookStats, EnumBookStats } from "../../../../db/schema/index.ts";
import { Type } from "@sinclair/typebox";
import { sql, asc, desc, eq, and, or, ilike } from "drizzle-orm";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/list',
    method: 'GET',
    schema: {
      tags: ['Admin/Book/Group'],
      summary: '',
      description: 'Get list of book groups with pagination, sorting, and search',
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
        categoryId: Type.Optional(Type.Number()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Array(Type.Object({
            id: Type.String({ format: 'uuid' }),
            versionId: Type.Number(),
            name: Type.String(),
            desc: Type.Optional(Type.String()),
            categoryId: Type.Number(),
            categoryName: Type.String(),
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
        search,
        categoryId,
      } = req.query as {
        page?: number;
        limit?: number;
        sort?: 'name' | 'total';
        order?: 'asc' | 'desc';
        search?: string;
        categoryId?: number;
      };

      // Create sort expression
      const orderBy = order === 'asc' ? asc : desc;
      const sortColumn = sort === 'total' ? bookStats.total : bookGroup.name;

      // Build base query for data
      const query = db
        .select({
          id: bookGroup.id,
          versionId: bookGroup.versionId,
          name: bookGroup.name,
          desc: bookGroup.desc,
          categoryId: bookGroup.categoryId,
          categoryName: bookCategory.name,
          total: bookStats.total,
           status: bookGroup.status,
           createdAt: bookGroup.createdAt,
           updatedAt: bookGroup.updatedAt,
        })
        .from(bookGroup)
        .leftJoin(
          bookCategory,
          eq(bookGroup.categoryId, bookCategory.id)
        )
        .leftJoin(
          bookStats,
          and(
            eq(bookGroup.id, bookStats.referenceId),
            eq(bookStats.type, EnumBookStats.group)
          )
        )
        .$dynamic();

      // Build count query
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(bookGroup)
        .$dynamic();

      // Add search condition if provided
      if (search && search.trim() !== '') {
        const searchTerm = `%${search}%`;
        const searchCondition = or(
          ilike(bookGroup.name, searchTerm),
          ilike(bookGroup.desc, searchTerm)
        );

        query.where(searchCondition);
        countQuery.where(searchCondition);
      }

      // Add category filter if provided
      if (categoryId) {
        query.where(eq(bookGroup.categoryId, categoryId));
        countQuery.where(eq(bookGroup.categoryId, categoryId));
      }

      // Apply sorting and pagination
      query
        .orderBy(orderBy(sortColumn))
        .limit(limit)
        .offset((page - 1) * limit);

      // Execute queries
      const [data, totalCount] = await Promise.all([
        query.limit(limit).offset((page - 1) * limit),
        countQuery.then((res) => Number(res[0].count)),
      ]);

      return reply.send({
        success: true,
        data: data.map((item) => ({
          ...item,
          total: item.total || 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        })),
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    }, 422)
  });
};
export default protectedRoute;
