import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import {
  StartSessionBody,
  StartSessionResponse,
} from "../../../modules/exam/sessions/sessions.schema.ts";
import { startSessionService } from "../../../modules/exam/sessions/services/start-session.service.ts";

const startSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/start",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      body: StartSessionBody,
      response: {
        201: StartSessionResponse,
        200: StartSessionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof StartSessionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof StartSessionResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await startSessionService(userId, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      const isResumed = result.data.isResumed;
      return reply.status(isResumed ? 200 : 201).send({
        success: true,
        message: request.t(($) => $.exam.sessions.start.success),
        data: result.data,
      });
    },
  });
};

export default startSessionRoute;
