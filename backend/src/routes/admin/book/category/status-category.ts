import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import {db} from "../../../../db/index.ts";
import {withErrorHandler} from "../../../../utils/withErrorHandler.ts";
import {bookCategory, bookGroup, EnumDataStatus} from "../../../../db/schema/index.ts";
import {eq} from "drizzle-orm";
import type {FastifyReply, FastifyRequest} from "fastify";
import {Type} from "@sinclair/typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.patch(
    "/:id/status",
    {
      schema: {
        tags: ["Admin/Book/Category"],
        summary: "",
        description: "Update the published status of a book category",
        params: Type.Object({
          id: Type.Number()
        }),
        body: Type.Object({
          status: Type.String()
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
    },
    withErrorHandler(
      async (req: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
        const {id} = req.params as { id: number };
        const {status} = req.body as { status: string };

        if (status && !Object.values(EnumDataStatus).includes(status as keyof typeof EnumDataStatus)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid status value',
          });
        }

        // Check if category exists
        const [existingCategory] = await db
          .select()
          .from(bookCategory)
          .where(eq(bookCategory.id, id));

        if (!existingCategory) {
          return reply.status(404).send({
            success: false,
            message: "Category not found"
          });
        }

        // Update the isPublished status of the category
        await db
          .update(bookCategory)
          .set({
            status: status,
            updatedAt: new Date()
          })
          .where(eq(bookCategory.id, id));

        // Also update all related booksGroup records
        await db
          .update(bookGroup)
          .set({
            status: status,
            updatedAt: new Date()
          })
          .where(eq(bookGroup.categoryId, existingCategory.id));

        return reply.status(200).send({
          success: true,
          message: `Category and its groups have been ${status} successfully`
        });
      }, 422
    )
  );
}
export default protectedRoute
