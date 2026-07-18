import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { deleteTagService } from "../../../../modules/education/tags/services/delete-tag.service.ts";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";

const deleteTagRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Tags"],
      params: Type.Object({ id: Type.String({ format: "uuid" }) }),
      response: { 200: BaseResponseSchema, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = request.params;
      const result = await deleteTagService(id);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.tags.delete.success),
      });
    },
  });
};

export default deleteTagRoute;
