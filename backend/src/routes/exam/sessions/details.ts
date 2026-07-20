import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { DetailsSessionResponse } from "../../../modules/exam/sessions/sessions.schema.ts";
import { detailsSessionService } from "../../../modules/exam/sessions/services/details-session.service.ts";

const Params = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const detailsSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/details/:id",
    method: "GET",
    schema: {
      tags: ["Client Exam Sessions"],
      params: Params,
      response: {
        200: DetailsSessionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof Params.static }>,
      reply: FastifyReply,
    ): Promise<typeof DetailsSessionResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await detailsSessionService(userId, request.params.id);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.sessions.details.success),
        data: result.data,
      });
    },
  });
};

export default detailsSessionRoute;
