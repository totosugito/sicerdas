import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const Params = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to delete" }),
});

const DeleteResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
});

const deleteUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Users Management"],
      summary: "Delete a user (Admin only)",
      params: Params,
      response: {
        200: DeleteResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ): Promise<typeof DeleteResponse.static> {
      const { t } = getTypedI18n(req);
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.session.user.id) {
        return reply.badRequest(t(($) => $.user.errors.accessDenied));
      }

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: (fields) => eq(fields.id, id),
      });

      if (!user) {
        return reply.notFound(t(($) => $.user.userNotFound));
      }

      try {
        await db.delete(users).where(eq(users.id, id));

        return reply.status(200).send({
          success: true,
          message: t(($) => $.user.management.delete.success),
        });
      } catch (error: any) {
        // PostgreSQL error code for foreign key violation is 23503
        if (error && typeof error === "object" && "code" in error && error.code === "23503") {
          return reply.badRequest(t(($) => $.user.management.delete.inUse));
        }
        throw error;
      }
    }),
  });
};

export default deleteUser;
