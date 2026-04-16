import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../db/db-pool.ts";
import { users, usersProfile } from "../../db/schema/user/index.ts";
import { withErrorHandler } from "../../utils/withErrorHandler.ts";
import { getTypedI18n } from "../../utils/i18n-typed.ts";
import { eq } from "drizzle-orm";
import { getUserAvatarUrl } from "../../utils/user-utils.ts";
import type { FastifyReply, FastifyRequest } from "fastify";

const Params = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to retrieve" }),
});

const DetailsResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
  data: Type.Any(),
});

const detailsUser: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/:id",
    method: "GET",
    schema: {
      tags: ["Users Management"],
      summary: "Get user details by ID",
      params: Params,
      response: {
        200: DetailsResponse,
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
    ): Promise<typeof DetailsResponse.static> {
      const { t } = getTypedI18n(req);
      const { id } = req.params;

      const userWithProfile = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          image: users.image,
          emailVerified: users.emailVerified,
          banned: users.banned,
          banReason: users.banReason,
          banExpires: users.banExpires,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          school: usersProfile.school,
          educationLevel: usersProfile.educationLevel,
          grade: usersProfile.grade,
          phone: usersProfile.phone,
          address: usersProfile.address,
          bio: usersProfile.bio,
          dateOfBirth: usersProfile.dateOfBirth,
          tierId: usersProfile.tierId,
          extra: usersProfile.extra,
        })
        .from(users)
        .leftJoin(usersProfile, eq(users.id, usersProfile.id))
        .where(eq(users.id, id))
        .limit(1);

      const user = userWithProfile[0];

      if (!user) {
        return reply.notFound(t(($) => $.user.userNotFound));
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.user.management.details.success),
        data: {
          ...user,
          image: getUserAvatarUrl(user.id, user.image),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          dateOfBirth: user.dateOfBirth?.toISOString(),
          banExpires: user.banExpires?.toISOString(),
        },
      });
    }),
  });
};

export default detailsUser;
