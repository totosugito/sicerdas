import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { EnumUserRole } from "../../../db/schema/user/types.ts";
import { getUserDetailsService } from "../../../modules/user/index.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../types/response.ts";

const Params = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to retrieve" }),
});

const UserData = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  name: Type.Union([Type.String(), Type.Null()]),
  role: Type.Enum(EnumUserRole),
  image: Type.Union([Type.String(), Type.Null()]),
  emailVerified: Type.Boolean(),
  banned: Type.Boolean(),
  banReason: Type.Union([Type.String(), Type.Null()]),
  banExpires: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  phone: Type.Union([Type.String(), Type.Null()]),
  address: Type.Union([Type.String(), Type.Null()]),
  bio: Type.Union([Type.String(), Type.Null()]),
  dateOfBirth: Type.Union([Type.String(), Type.Null()]),
  extra: Type.Union([Type.Unknown(), Type.Null()]),
});

const DetailsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: UserData,
  }),
]);

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
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ): Promise<typeof DetailsResponse.static> {
      const { id } = req.params;

      const result = await getUserDetailsService(id);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        return reply.notFound(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.user.management.details.success),
        data: result.data as any,
      });
    },
  });
};

export default detailsUser;
