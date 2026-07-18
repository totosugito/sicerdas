import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createModelService } from "../../../../modules/ai/services/create-model.service.ts";
import { ModelCreateBody, ModelResponse } from "../../../../modules/ai/ai.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const createModelAiRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create-model",
    method: "POST",
    schema: {
      tags: ["Chat AI"],
      body: ModelCreateBody,
      response: {
        200: ModelResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof ModelCreateBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ModelResponse.static> {
      const result = await createModelService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 409) {
          return reply.badRequest(message);
        }
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.chatAi.model.create.success),
        data: result.data,
      });
    },
  });
};

export default createModelAiRoute;
