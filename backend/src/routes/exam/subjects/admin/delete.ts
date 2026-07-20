import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { deleteSubjectService } from "../../../../modules/exam/subjects/services/admin/delete-subject.service.ts";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";

const deleteSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Subjects"],
      params: Type.Object({ id: Type.String({ format: "uuid" }) }),
      response: { 200: BaseResponseSchema, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = request.params;
      const result = await deleteSubjectService(id);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.subjects.delete.success),
      });
    },
  });
};

export default deleteSubjectRoute;
