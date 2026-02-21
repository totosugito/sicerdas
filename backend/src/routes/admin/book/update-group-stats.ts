import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/db-pool.ts";
import { bookGroup, bookGroupStats, books } from "../../../db/schema/book/index.ts";
import { eq, count, and } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";

const UpdateGroupStatsParams = Type.Object({
  groupId: Type.Number({ description: 'ID of the book group to update stats for' })
});

const UpdateGroupStatsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    groupId: Type.Number(),
    bookTotal: Type.Number(),
    updatedAt: Type.String({ format: 'date-time' })
  })
});

const adminRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/update-group-stats/:groupId',
    method: 'POST',
    schema: {
      tags: ['Admin/Book'],
      summary: 'Update book group statistics',
      description: 'Recalculate and update the book total count for a specific book group',
      params: UpdateGroupStatsParams,
      response: {
        200: UpdateGroupStatsResponse,
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Params: typeof UpdateGroupStatsParams.static }>,
      reply: FastifyReply
    ): Promise<typeof UpdateGroupStatsResponse.static> {
      const { groupId } = req.params;

      // Verify the book group exists
      const existingGroup = await db
        .select()
        .from(bookGroup)
        .where(eq(bookGroup.id, groupId))
        .limit(1);

      if (existingGroup.length === 0) {
        return reply.status(404).send({
          success: false,
          message: req.i18n.t('admin.book.groupStats.notFound'),
          data: null
        });
      }

      // Count the total number of published books in this group
      const bookCountResult = await db
        .select({ count: count() })
        .from(books)
        .where(and(
          eq(books.bookGroupId, groupId),
          eq(books.status, EnumContentStatus.PUBLISHED)
        ));

      const bookTotal = Number(bookCountResult[0].count);

      // Check if stats record already exists for this group
      const existingStats = await db
        .select()
        .from(bookGroupStats)
        .where(eq(bookGroupStats.bookGroupId, groupId))
        .limit(1);

      let updatedStats;
      if (existingStats.length > 0) {
        // Update existing stats record
        updatedStats = await db
          .update(bookGroupStats)
          .set({
            bookTotal,
            updatedAt: new Date()
          })
          .where(eq(bookGroupStats.bookGroupId, groupId))
          .returning();
      } else {
        // Create new stats record
        updatedStats = await db
          .insert(bookGroupStats)
          .values({
            bookGroupId: groupId,
            bookTotal
          })
          .returning();
      }

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('admin.book.groupStats.updateSuccess'),
        data: {
          groupId: updatedStats[0].bookGroupId,
          bookTotal: updatedStats[0].bookTotal,
          updatedAt: updatedStats[0].updatedAt?.toISOString() || new Date().toISOString()
        }
      });
    })
  });
};

export default adminRoute;