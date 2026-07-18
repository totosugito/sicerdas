import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { updateTagService } from "../../../../modules/education/tags/services/update-tag.service.ts";
import { UpdateTagBody, TagDetailResponse } from "../../../../modules/education/tags/education.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const updateTagRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Tags"],
      params: Type.Object({ id: Type.String({ format: "uuid" }) }),
      body: UpdateTagBody,
      response: { 200: TagDetailResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: string }; Body: typeof UpdateTagBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof TagDetailResponse.static> {
      const { id } = request.params;
      const result = await updateTagService(id, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.tags.update.success),
        data: result.data,
      });
    },
  });
};

export default updateTagRoute;
