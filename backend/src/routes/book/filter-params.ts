import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { db } from "../../db/db-pool.ts";
import { bookCategory, bookGroup, bookGroupStats } from "../../db/schema/book-schema.ts";
import { eq, and, gt, isNotNull, or, isNull } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const FilterParamsResponseItem = Type.Object({
  id: Type.Number(),
  code: Type.String(),
  name: Type.String(),
  desc: Type.Optional(Type.String()),
  status: Type.String(),
  groups: Type.Array(Type.Object({
    id: Type.Number(),
    name: Type.String(),
    shortName: Type.String(),
    desc: Type.Optional(Type.String()),
    status: Type.String(),
    stats: Type.Object({
      bookTotal: Type.Number(),
    }),
  })),
});

const FilterParamsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(FilterParamsResponseItem),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/filter-params',
    method: 'GET',
    schema: {
      tags: ['V1/Book'],
      summary: 'Get filter parameters',
      description: 'Get all book categories with their associated groups and statistics',
      response: {
        200: FilterParamsResponse,
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
      req: FastifyRequest,
      reply: FastifyReply
    ): Promise<typeof FilterParamsResponse.static> {
      // Get all categories with their groups and stats, only for groups that have bookTotal > 0
      const result = await db
        .select({
          categoryId: bookCategory.id,
          categoryCode: bookCategory.code,
          categoryName: bookCategory.name,
          categoryDesc: bookCategory.desc,
          categoryStatus: bookCategory.status,
          groupId: bookGroup.id,
          groupName: bookGroup.name,
          groupShortName: bookGroup.shortName,
          groupDesc: bookGroup.desc,
          groupStatus: bookGroup.status,
          bookTotal: bookGroupStats.bookTotal,
        })
        .from(bookCategory)
        .leftJoin(bookGroup, eq(bookGroup.categoryId, bookCategory.id))
        .leftJoin(bookGroupStats, eq(bookGroupStats.bookGroupId, bookGroup.id))
        .where(
          or(
            and(isNotNull(bookGroupStats.bookTotal), gt(bookGroupStats.bookTotal, 0)),
            isNull(bookGroup.id) // Include categories even if they have no groups
          )
        )
        .orderBy(bookCategory.id, bookGroup.id);

      // Group the results by category
      const categoriesMap = new Map<number, typeof FilterParamsResponseItem.static>();

      for (const row of result) {
        if (!categoriesMap.has(row.categoryId)) {
          categoriesMap.set(row.categoryId, {
            id: row.categoryId,
            code: row.categoryCode || '',
            name: row.categoryName || '',
            desc: row.categoryDesc || undefined,
            status: row.categoryStatus || '',
            groups: [],
          });
        }

        const category = categoriesMap.get(row.categoryId)!;

        // Add group if it exists and has a valid ID
        if (row.groupId !== null) {
          category.groups.push({
            id: row.groupId,
            name: row.groupName || '',
            shortName: row.groupShortName || '',
            desc: row.groupDesc || undefined,
            status: row.groupStatus || '',
            stats: {
              bookTotal: row.bookTotal || 0,
            },
          });
        }
      }

      // Only include categories that have at least one group
      const categoriesWithGroups = Array.from(categoriesMap.values()).filter(category => category.groups.length > 0);

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('book.filterParams.success'),
        data: categoriesWithGroups,
      });
    }),
  });
};

export default publicRoute;