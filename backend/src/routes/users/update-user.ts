import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users, usersProfile, EnumUserRole } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const UpdateBody = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to update" }),
  name: Type.Optional(Type.String({ description: "New full name" })),
  role: Type.Optional(Type.Enum(EnumUserRole, { description: "New user role" })),
  banned: Type.Optional(Type.Boolean({ description: "Whether the user is banned" })),
  banReason: Type.Optional(Type.String({ description: "Reason for the ban" })),
  school: Type.Optional(Type.String({ description: "New school name" })),
  grade: Type.Optional(Type.String({ description: "New grade level" })),
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
      const { id, name, role, banned, banReason, school, grade } = req.body;

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: (fields) => eq(fields.id, id),
      });

      if (!user) {
        return reply.notFound(t(($) => $.user.userNotFound));
      }

      await db.transaction(async (tx) => {
        // Update users table with explicit field assignment
        if (
          name !== undefined ||
          role !== undefined ||
          banned !== undefined ||
          banReason !== undefined
        ) {
          await tx
            .update(users)
            .set({
              ...(name !== undefined && { name }),
              ...(role !== undefined && { role }),
              ...(banned !== undefined && { banned }),
              ...(banReason !== undefined && { banReason }),
              updatedAt: new Date(),
            })
            .where(eq(users.id, id));
        }

        // Update profile table with explicit field assignment
        if (school !== undefined || grade !== undefined) {
          const profileUpdate = {
            ...(school !== undefined && { school }),
            ...(grade !== undefined && { grade }),
            updatedAt: new Date(),
          };

          await tx
            .insert(usersProfile)
            .values({ id, ...profileUpdate })
            .onConflictDoUpdate({
              target: usersProfile.id,
              set: profileUpdate,
            });
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
