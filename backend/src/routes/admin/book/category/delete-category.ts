import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import type {FastifyRequest, FastifyReply} from "fastify";
import {db} from "../../../../db/index.ts";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {bookCategory, EnumBookStats, bookStats} from "../../../../db/schema/index.ts";
import {and, eq} from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id',
    method: 'DELETE',
    schema: {
      tags: ['Admin/Book/Category'],
      summary: '',
      description: 'Book Categories Delete',
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
        const categoryId = req.params.id; // This is now a number

        // First get the category from booksCategory table
        const category = await db.select()
          .from(bookCategory)
          .where(eq(bookCategory.id, categoryId))
          .limit(1);

        if (!category.length) {
          return reply.status(404).send({
            success: false,
            message: 'Category not found',
          });
        }

        // Get category data with total
        const categoryData = await db.select({
          referenceId: bookStats.referenceId,
          total: bookStats.total
        })
        .from(bookStats)
        .where(
          and(
            eq(bookStats.referenceId, categoryId),
            eq(bookStats.type, EnumBookStats.category)
          )
        )
        .limit(1);

        // Check if category has books (total > 0)
        if (categoryData.length > 0 && categoryData[0].total > 0) {
          return reply.status(409).send({
            success: false,
            message: 'Cannot delete book category with associated books',
            data: categoryData[0]
          });
        }

        // Delete both category and category data in a transaction
        await db.transaction(async (tx) => {
          // First delete from statsBooks
          await tx.delete(bookStats)
            .where(
              and(
                eq(bookStats.referenceId, categoryId),
                eq(bookStats.type, EnumBookStats.category)
              )
            );

          // Then delete from booksCategory
          await tx.delete(bookCategory)
            .where(eq(bookCategory.id, categoryId));
        });

        return reply.status(200).send({
          success: true,
          message: 'Book Category deleted successfully'
        });
      },
      422
    ),
  });
}

export default protectedRoute
