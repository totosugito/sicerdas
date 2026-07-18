import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { deleteGradeService } from "../../../../modules/education/grades/services/delete-grade.service.ts";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";

const deleteGradeRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Education Grades"],
      params: Type.Object({ id: Type.Number() }),
      response: { 200: BaseResponseSchema, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: number } }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = request.params;
      const result = await deleteGradeService(id);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.grades.delete.success),
      });
    },
  });
};

export default deleteGradeRoute;
