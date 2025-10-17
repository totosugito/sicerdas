import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import type {FastifyRequest, FastifyReply} from "fastify";
import {db} from "../../../../db/index.ts";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {bookGroup, bookStats, EnumBookStats} from "../../../../db/schema/index.ts";
import {eq, and} from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id',
    method: 'DELETE',
    schema: {
      tags: ['Admin/Book/Group'],
      summary: '',
      description: 'Delete a book group',
      params: Type.Object({
        id: Type.Number(),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        404: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        409: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          data: Type.Optional(Type.Object({
            referenceId: Type.Number(),
            total: Type.Number()
          }))
        }),
        500: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        })
      }
    },
    handler: withErrorHandler(
      async (req: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
        const groupId = req.params.id;

        // First get the group from booksGroup table
        const group = await db.select()
          .from(bookGroup)
          .where(eq(bookGroup.id, groupId))
          .limit(1);

        if (!group.length) {
          return reply.status(404).send({
            success: false,
            message: 'Group not found'
          });
        }

        // Get group data with total
        const groupData = await db.select({
          referenceId: bookStats.referenceId,
          total: bookStats.total
        })
        .from(bookStats)
        .where(
          and(
            eq(bookStats.referenceId, groupId),
            eq(bookStats.type, EnumBookStats.group)
          )
        )
        .limit(1);

        // Check if group has books (total > 0)
        if (groupData.length > 0 && groupData[0].total > 0) {
          return reply.status(409).send({
            success: false,
            message: 'Cannot delete group that contains books',
            data: groupData[0]
          });
        }

        // Delete both group and group data in a transaction
        await db.transaction(async (tx) => {
          // First delete from statsBooks
          await tx.delete(bookStats)
            .where(
              and(
                eq(bookStats.referenceId, groupId),
                eq(bookStats.type, EnumBookStats.group)
              )
            );

          // Then delete from booksGroup
          await tx.delete(bookGroup)
            .where(eq(bookGroup.id, groupId));
        });

        return reply.status(200).send({
          success: true,
          message: 'Book group deleted successfully'
        });
      },
      422
    ),
  });
}
export default protectedRoute
