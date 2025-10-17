import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/index.ts";
import { books, bookStats, EnumBookStats } from "../../../db/schema/index.ts";
import { and, eq, sql } from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/book',
    method: 'GET',
    schema: {
      tags: ['Admin/Sync'],
      summary: '',
      description: 'Synchronize book statistics. Calculate and update book statistics by group, category, and grade',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          data: Type.Object({
            groups: Type.Number(),
            groupGrades: Type.Number()
          })
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        403: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        500: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        })
      }
    },
    handler: withErrorHandler(
      async (_req, reply) => {

        // Start a transaction to ensure data consistency
        await db.transaction(async (tx) => {
          // 1. Get all book groups with their counts
          const groupStats = await tx
            .select({
              groupId: books.bookGroupId,
              count: sql<number>`count(${books.id})`.as('count')
            })
            .from(books)
            .where(eq(books.status, 'published'))
            .groupBy(books.bookGroupId);

          // Update or insert group stats
          for (const stat of groupStats) {
            // Check if record exists with the same type and referenceId
            const existingStat = await tx.query.bookStats.findFirst({
              where: (bookStats, { and, eq }) => and(
                eq(bookStats.referenceId, stat.groupId),
                eq(bookStats.type, EnumBookStats.group)
              )
            });

            if (existingStat) {
              // Update existing record
              await tx
                .update(bookStats)
                .set({
                  total: stat.count,
                  updatedAt: new Date()
                })
                .where(
                  and(
                    eq(bookStats.referenceId, stat.groupId),
                    eq(bookStats.type, EnumBookStats.group)
                  )
                );
            } else {
              // Insert new record
              await tx.insert(bookStats).values({
                type: EnumBookStats.group,
                referenceId: stat.groupId,
                secondaryReferenceId: null,
                total: stat.count,
                extra: {},
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }

          // 2. Get all books grouped by both groupId and gradeId
          const groupGradeStats = await tx
            .select({
              groupId: books.bookGroupId,
              gradeId: books.educationGradeId,
              count: sql<number>`count(${books.id})`.as('count')
            })
            .from(books)
            .where(eq(books.status, 'published'))
            .groupBy(books.bookGroupId, books.educationGradeId);

          // Update or insert group-grade combined stats
          for (const stat of groupGradeStats) {
            // Check if record exists with the same type, referenceId and secondaryReferenceId
            const existingStat = await tx.query.bookStats.findFirst({
              where: (bookStats, { and, eq }) => and(
                eq(bookStats.referenceId, stat.groupId),
                eq(bookStats.secondaryReferenceId, stat.gradeId),
                eq(bookStats.type, EnumBookStats.group_grade)
              )
            });

            if (existingStat) {
              // Update existing record
              await tx
                .update(bookStats)
                .set({
                  total: stat.count,
                  updatedAt: new Date()
                })
                .where(
                  and(
                    eq(bookStats.referenceId, stat.groupId),
                    eq(bookStats.secondaryReferenceId, stat.gradeId),
                    eq(bookStats.type, EnumBookStats.group_grade)
                  )
                );
            } else {
              // Insert new record
              await tx.insert(bookStats).values({
                type: EnumBookStats.group_grade,
                referenceId: stat.groupId,
                secondaryReferenceId: stat.gradeId,
                total: stat.count,
                extra: {},
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
        });

        // Get the final counts for the response
        const [groupCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(bookStats)
          .where(eq(bookStats.type, EnumBookStats.group));

        const [groupGradeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(bookStats)
          .where(eq(bookStats.type, EnumBookStats.group_grade));

        return reply.status(200).send({
          success: true,
          message: 'Book statistics synchronized successfully',
          data: {
            groups: Number(groupCount?.count || 0),
            groupGrades: Number(groupGradeCount?.count || 0)
          }
        });
      }, 422
    )
  });
}
export default protectedRoute;
