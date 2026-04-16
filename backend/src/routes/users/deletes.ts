import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { inArray } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const DeletesBody = Type.Object({
  ids: Type.Array(Type.String({ format: "uuid" }), {
    minItems: 1,
    description: "List of User IDs to delete",
  }),
});

const DeletesResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
});

const bulkDeleteUsers: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/deletes",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Bulk delete users (Admin only)",
      body: DeletesBody,
      response: {
        200: DeletesResponse,
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
      req: FastifyRequest<{ Body: typeof DeletesBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof DeletesResponse.static> {
      const { t } = getTypedI18n(req);
      const { ids } = req.body;

      try {
        await db.delete(users).where(inArray(users.id, ids));

        return reply.status(200).send({
          success: true,
          message: t(($) => $.user.management.delete.success),
        });
      } catch (error: any) {
        // Handle referential integrity errors (23503)
        if (error.code === "23503") {
          return reply.badRequest(t(($) => $.user.management.delete.inUse));
        }
        throw error;
      }
    }),
  });
};

export default bulkDeleteUsers;
