import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from "better-auth/node";

const BanBody = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to ban/unban" }),
  banned: Type.Boolean({ description: "True to ban, false to unban" }),
  banReason: Type.Optional(Type.String({ description: "Reason for the ban" })),
});

const BanResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
});

const banUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/ban",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Ban or unban a user (Admin only)",
      body: BanBody,
      response: {
        200: BanResponse,
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
      req: FastifyRequest<{ Body: typeof BanBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BanResponse.static> {
      const { t } = getTypedI18n(req);
      const { id, banned, banReason } = req.body;

      // Determine user role from session
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const adminId = session?.user?.id;

      if (adminId === id) {
        return reply.badRequest(t(($) => $.user.management.update.cannotBanSelf));
      }

      const user = await db.query.users.findFirst({
        where: (fields) => eq(fields.id, id),
      });

      if (!user) {
        return reply.notFound(t(($) => $.user.userNotFound));
      }

      await db
        .update(users)
        .set({
          banned,
          banReason: banned ? (banReason ?? null) : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      return reply.status(200).send({
        success: true,
        message: t(($) =>
          banned ? $.user.management.update.success : $.user.management.update.success,
        ),
      });
    }),
  });
};

export default banUser;
