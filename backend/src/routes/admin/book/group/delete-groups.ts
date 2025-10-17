import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import type {FastifyRequest, FastifyReply} from "fastify";
import {db} from "../../../../db/index.ts";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {bookGroup, bookStats, EnumBookStats} from "../../../../db/schema/index.ts";
import {inArray, and, eq} from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/deletes',
    method: 'DELETE',
    schema: {
      tags: ['Admin/Book/Group'],
      summary: '',
      description: 'Delete multiple book groups',
      body: Type.Object({
        ids: Type.Array(Type.Number()),
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
          data: Type.Array(Type.Object({
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
      async (req: FastifyRequest<{ Body: { ids: number[] } }>, reply: FastifyReply) => {
        const ids = req.body.ids;

        // First get the groups from booksGroup table
        const groups = await db.select()
          .from(bookGroup)
          .where(inArray(bookGroup.id, ids));

        if (groups.length === 0) {
          return reply.status(404).send({
            success: false,
            message: 'No groups found with the provided IDs',
          });
        }

        // Get stats for all groups
        const groupData = await db.select({
          referenceId: bookStats.referenceId,
          total: bookStats.total
        })
        .from(bookStats)
        .where(
          and(
            inArray(bookStats.referenceId, groups.map(g => g.id)),
            eq(bookStats.type, EnumBookStats.group)
          )
        );

        // Check if any group has books (total > 0)
        const groupsWithBooks = groupData.filter(item => item.total > 0);
        if (groupsWithBooks.length > 0) {
          return reply.status(409).send({
            success: false,
            message: 'Cannot delete book groups that contain books',
            data: groupsWithBooks
          });
        }

        // Delete both group and group data in a transaction
        await db.transaction(async (tx) => {
          const groupIds = groups.map(g => g.id);

          // First delete from statsBooks
          await tx.delete(bookStats)
            .where(
              and(
                inArray(bookStats.referenceId, groupIds),
                eq(bookStats.type, EnumBookStats.group)
              )
            );

          // Then delete from booksGroup
          await tx.delete(bookGroup)
            .where(inArray(bookGroup.id, groupIds));
        });

        return reply.status(200).send({
          success: true,
          message: `${groups.length} Book Group${groups.length !== 1 ? 's' : ''} deleted successfully`
        });
      },
      422
    ),
  });
}
export default protectedRoute
