import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { SubmitSessionResponse } from "../../../modules/exam/sessions/sessions.schema.ts";
import { submitSessionService } from "../../../modules/exam/sessions/services/submit-session.service.ts";

const SubmitSessionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const submitSessionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/submit/:id",
    method: "POST",
    schema: {
      tags: ["Client Exam Sessions"],
      params: SubmitSessionParams,
      response: {
        200: SubmitSessionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof SubmitSessionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof SubmitSessionResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await submitSessionService(userId, request.params.id);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        if (result.statusCode === 403) {
          return reply.forbidden(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.sessions.submit.success),
        data: result.data,
      });
    },
  });
};

export default submitSessionRoute;
