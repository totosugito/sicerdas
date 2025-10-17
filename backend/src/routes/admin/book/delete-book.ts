import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import type {FastifyRequest, FastifyReply} from "fastify";
import {db} from "../../../db/index.ts";
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {books} from "../../../db/schema/index.ts";
import {eq} from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id',
    method: 'DELETE',
    schema: {
      tags: ['Admin/Book'],
      summary: '',
      description: 'Delete a book',
      params: Type.Object({
        id: Type.String({ format: 'uuid' })
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
        500: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        })
      }
    },
    handler: withErrorHandler(
      async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const bookId = req.params.id;

        // First get the book by ID
        const [book] = await db
          .select()
          .from(books)
          .where(
            eq(books.id, bookId),
          )
          .limit(1);

        if (!book) {
          return reply.status(404).send({
            success: false,
            message: 'Book not found or not available for deletion'
          });
        }

        // Delete the book from the database
        await db.delete(books)
          .where(eq(books.id, bookId));

        return reply.send({
          success: true,
          message: 'Book deleted successfully'
        });
      },
      422
    ),
  });
}
export default protectedRoute
