import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import type {FastifyRequest, FastifyReply} from "fastify";
import {db} from "../../../db/index.ts";
import {withErrorHandler} from "../../../utils/withErrorHandler.ts";
import {books, EnumDataStatus} from "../../../db/schema/index.ts";
import {eq} from "drizzle-orm";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/:id/status',
    method: 'PATCH',
    schema: {
      tags: ['Admin/Book'],
      summary: '',
      description: 'Set the status of a book',
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      body: Type.Object({
        status: Type.Optional(
          Type.String()
        ),
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
      },
    },
    handler: withErrorHandler(
      async (req: FastifyRequest<{ 
        Params: { id: string },
        Body: { status: string }
      }>, reply: FastifyReply) => {
        const bookId = req.params.id;
        const {status} = req.body as { status: string};

        if (status && !Object.values(EnumDataStatus).includes(status as keyof typeof EnumDataStatus)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid status value',
          });
        }

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
            message: 'Book not found'
          });
        }

        // Update the book status
        await db.update(books)
          .set({
            status: status,
            updatedAt: new Date()
          })
          .where(eq(books.id, bookId));

        return reply.send({
          success: true,
          message: `Book update status to ${status} successfully`,
        });
      },
      422
    ),
  });
}
export default protectedRoute
