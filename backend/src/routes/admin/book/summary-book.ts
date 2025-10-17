import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { bookCategory, bookGroup, bookStats, EnumBookStats } from "../../../db/schema/index.ts";
import { eq, and } from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/summary',
    method: 'GET',
    schema: {
      tags: ['Admin/Book'],
      summary: '',
      description: 'Get book summary including categories and groups with their statistics',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            categories: Type.Array(
              Type.Object({
                id: Type.String({ format: 'uuid' }),
                name: Type.String(),
                code: Type.String(),
                status: Type.String(),
                totalBooks: Type.Number(),
                createdAt: Type.String({ format: 'date-time' }),
                updatedAt: Type.String({ format: 'date-time' })
              })
            ),
            groups: Type.Array(
              Type.Object({
                id: Type.String({ format: 'uuid' }),
                name: Type.String(),
                categoryId: Type.String({ format: 'uuid' }),
                categoryName: Type.String(),
                status: Type.String(),
                totalBooks: Type.Number(),
                createdAt: Type.String({ format: 'date-time' }),
                updatedAt: Type.String({ format: 'date-time' })
              })
            )
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
    handler: withErrorHandler(async (_req, reply) => {
      // Get all categories with their book counts
      const categories = await db
        .select({
          id: bookCategory.id,
          name: bookCategory.name,
          code: bookCategory.code,
          status: bookCategory.status,
          totalBooks: bookStats.total,
          createdAt: bookCategory.createdAt,
          updatedAt: bookCategory.updatedAt,
        })
        .from(bookCategory)
        .leftJoin(
          bookStats,
          and(
            eq(bookStats.referenceId, bookCategory.id),
            eq(bookStats.type, EnumBookStats.category)
          )
        )
        .orderBy(bookCategory.name);

      // Get all groups with their book counts and category names
      const groups = await db
        .select({
          id: bookGroup.id,
          name: bookGroup.name,
          categoryId: bookGroup.categoryId,
          categoryName: bookCategory.name,
          status: bookGroup.status,
          totalBooks: bookStats.total,
          createdAt: bookGroup.createdAt,
          updatedAt: bookGroup.updatedAt,
        })
        .from(bookGroup)
        .leftJoin(
          bookCategory,
          eq(bookStats.referenceId, bookGroup.categoryId)
        )
        .leftJoin(
          bookStats,
          and(
            eq(bookStats.referenceId, bookGroup.id),
            eq(bookStats.type, EnumBookStats.group)
          )
        )
        .orderBy(bookGroup.name);

      return reply.send({
        success: true,
        data: {
          categories: categories.map(cat => ({
            ...cat,
            totalBooks: Number(cat.totalBooks) || 0,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt
          })),
          groups: groups.map(group => ({
            ...group,
            totalBooks: Number(group.totalBooks) || 0,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt
          }))
        }
      });
    })
  });
};

export default protectedRoute;
