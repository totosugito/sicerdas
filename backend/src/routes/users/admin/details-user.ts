import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserDetailsService, UserDetailsResponseSchema } from "../../../modules/users/index.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const Params = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to retrieve" }),
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
        200: UserDetailsResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ): Promise<typeof UserDetailsResponseSchema.static> {
      const { id } = request.params;

      const result = await getUserDetailsService(id);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        return reply.notFound(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.user.management.details.success),
        data: result.data as any,
      });
    },
  });
};

export default detailsUser;
