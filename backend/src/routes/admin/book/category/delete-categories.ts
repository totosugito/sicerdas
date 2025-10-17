import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import type {FastifyRequest, FastifyReply} from "fastify";
import {db} from "../../../../db/index.ts";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {bookCategory, bookStats, EnumBookStats} from "../../../../db/schema/index.ts";
import {inArray, and, eq} from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/deletes',
    method: 'DELETE',
    schema: {
      tags: ['Admin/Book/Category'],
      summary: '',
      description: 'Book Categories Delete',
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

        // First get the categories from booksCategory table
        const categories = await db.select()
          .from(bookCategory)
          .where(inArray(bookCategory.id, ids));

        if (categories.length === 0) {
          return reply.status(404).send({
            success: false,
            message: 'No categories found with the provided IDs',
          });
        }

        // Get stats for all categories
        const categoryData = await db.select({
          referenceId: bookStats.referenceId,
          total: bookStats.total
        })
        .from(bookStats)
        .where(
          and(
            inArray(bookStats.referenceId, categories.map(c => c.id)),
            eq(bookStats.type, EnumBookStats.category)
          )
        );

        // Check if any category has books (total > 0)
        const categoriesWithBooks = categoryData.filter(item => item.total > 0);
        if (categoriesWithBooks.length > 0) {
          return reply.status(409).send({
            success: false,
            message: 'Cannot delete book categories with associated books',
            data: categoriesWithBooks
          });
        }

        // Delete both category and category data in a transaction
        await db.transaction(async (tx) => {
          const categoryIds = categories.map(c => c.id);

          // First delete from statsBooks
          await tx.delete(bookStats)
            .where(
              and(
                inArray(bookStats.referenceId, categoryIds),
                eq(bookStats.type, EnumBookStats.category)
              )
            );

          // Then delete from booksCategory
          await tx.delete(bookCategory)
            .where(inArray(bookCategory.id, categoryIds));
        });

        return reply.status(200).send({
          success: true,
          message: `${categories.length} Book Categor${categories.length === 1 ? 'y' : 'ies'} deleted successfully`
        });
      },
      422
    ),
  });
}
export default protectedRoute
