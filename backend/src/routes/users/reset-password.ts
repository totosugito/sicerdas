import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { accounts } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";

const ResetPasswordBody = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to reset password" }),
  newPassword: Type.String({ minLength: 6, description: "New password" }),
});

const ResetPasswordResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
});

const resetPassword: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/reset-password",
    method: "POST",
    schema: {
      tags: ["Users Management"],
      summary: "Reset user password (Admin only)",
      description:
        "Forcefully reset any user password by ID. Does not require the current password.",
      body: ResetPasswordBody,
      response: {
        200: ResetPasswordResponse,
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
      req: FastifyRequest<{ Body: typeof ResetPasswordBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ResetPasswordResponse.static> {
      const { t } = getTypedI18n(req);
      const { id, newPassword } = req.body;
      const auth = getAuthInstance(app);

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: (fields) => eq(fields.id, id),
      });

      if (!user) {
        return reply.notFound(t(($) => $.user.userNotFound));
      }

      // Check if account exists for the user
      const [userAccount] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, id))
        .limit(1);

      if (!userAccount) {
        return reply.notFound(t(($) => $.user.accountNotFound));
      }

      // Get auth context for password hashing
      const context = await auth.$context;
      const hashedPassword = await context.password.hash(newPassword);

      // Update password in accounts table
      await db
        .update(accounts)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(accounts.userId, id));

      return reply.status(200).send({
        success: true,
        message: t(($) => $.user.passwordUpdatedSuccessfully),
      });
    }),
  });
};

export default resetPassword;
