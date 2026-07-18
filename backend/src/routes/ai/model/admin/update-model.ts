import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { updateModelService } from "../../../../modules/ai/services/update-model.service.ts";
import { ModelUpdateBody, ModelResponse } from "../../../../modules/ai/ai.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const updateModelAiRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/model/:id",
    method: "PATCH",
    schema: {
      tags: ["Chat AI"],
      params: Type.Object({ id: Type.String() }),
      body: ModelUpdateBody,
      response: {
        200: ModelResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: string }; Body: typeof ModelUpdateBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof ModelResponse.static> {
      const { id } = request.params;
      const result = await updateModelService(id, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        if (result.statusCode === 409) {
          return reply.badRequest(message);
        }
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.chatAi.model.update.success),
        data: result.data,
      });
    },
  });
};

export default updateModelAiRoute;
