import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { AbandonSessionResponse } from "../../../modules/exam/sessions/sessions.schema.ts";
import { abandonSessionService } from "../../../modules/exam/sessions/services/abandon-session.service.ts";

const AbandonParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const abandonSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/abandon/:id",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      params: AbandonParams,
      response: {
        200: AbandonSessionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof AbandonParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof AbandonSessionResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await abandonSessionService(userId, request.params.id);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.sessions.abandon.success),
        data: result.data,
      });
    },
  });
};

export default abandonSessionRoute;
