import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users, EnumUserRole } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const UpdateBody = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to update" }),
  name: Type.Optional(Type.String({ description: "New full name" })),
  email: Type.Optional(Type.String({ format: "email", description: "New email address" })),
  role: Type.Optional(Type.Enum(EnumUserRole, { description: "New user role" })),
});

const UpdateResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
  data: Type.Optional(Type.Any()),
});

const updateUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update",
    method: "PATCH",
    schema: {
      tags: ["Users Management"],
      summary: "Update user details (Admin only)",
      body: UpdateBody,
      response: {
        200: UpdateResponse,
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
      req: FastifyRequest<{ Body: typeof UpdateBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof UpdateResponse.static> {
      const { t } = getTypedI18n(req);

      // Explicitly destructure for Mass Assignment Protection
      const { id, name, email, role } = req.body;

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: (fields) => eq(fields.id, id),
      });

      if (!user) {
        return reply.notFound(t(($) => $.user.userNotFound));
      }

      // If email is being changed, check if new email is already taken
      if (email && email !== user.email) {
        const existingUser = await db.query.users.findFirst({
          where: (fields) => eq(fields.email, email),
        });

        if (existingUser) {
          return reply.conflict(t(($) => $.user.management.update.emailExists));
        }
      }

      await db.transaction(async (tx) => {
        // Update users table with explicit field assignment
        if (name !== undefined || email !== undefined || role !== undefined) {
          await tx
            .update(users)
            .set({
              ...(name !== undefined && { name }),
              ...(email !== undefined && { email }),
              ...(role !== undefined && { role }),
              updatedAt: new Date(),
            })
            .where(eq(users.id, id));
        }
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.user.management.update.success),
      });
    }),
  });
};

export default updateUser;
