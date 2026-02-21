import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/db-pool.ts";
import { bookGroup, bookGroupStats, books } from "../../../db/schema/book-schema.ts";
import { eq, count, and } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";

const adminRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/update-all-group-stats',
    method: 'POST',
    schema: {
      tags: ['Admin/Book'],
      summary: 'Update all book group statistics',
      description: 'Recalculate and update the book total count for all book groups',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          data: Type.Array(Type.Object({
            groupId: Type.Number(),
            bookTotal: Type.Number(),
            updatedAt: Type.String({ format: 'date-time' })
          }))
        })
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest,
      reply: FastifyReply
    ) {
      // Get all book groups that have published books
      const allGroups = await db
        .select({ id: bookGroup.id })
        .from(bookGroup)
        .innerJoin(books, eq(bookGroup.id, books.bookGroupId))
        .where(eq(books.status, EnumContentStatus.PUBLISHED))
        .groupBy(bookGroup.id);

      const results = [];

      // Update stats for each group
      for (const group of allGroups) {
        // Count published books for this group
        const bookCountResult = await db
          .select({ count: count() })
          .from(books)
          .where(and(
            eq(books.bookGroupId, group.id),
            eq(books.status, EnumContentStatus.PUBLISHED)
          ));

        const bookTotal = Number(bookCountResult[0].count);

        // Check if stats record already exists for this group
        const existingStats = await db
          .select()
          .from(bookGroupStats)
          .where(eq(bookGroupStats.bookGroupId, group.id))
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
            .where(eq(bookGroupStats.bookGroupId, group.id))
            .returning();
        } else {
          // Create new stats record
          updatedStats = await db
            .insert(bookGroupStats)
            .values({
              bookGroupId: group.id,
              bookTotal
            })
            .returning();
        }

        results.push({
          groupId: updatedStats[0].bookGroupId,
          bookTotal: updatedStats[0].bookTotal,
          updatedAt: updatedStats[0].updatedAt?.toISOString() || new Date().toISOString()
        });
      }

      return reply.status(200).send({
        success: true,
        message: req.i18n.t('admin.book.groupStats.updateAllSuccess'),
        data: results
      });
    })
  });
};

export default adminRoute;