import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { updateSubjectService } from "../../../../modules/exam/subjects/services/admin/update-subject.service.ts";
import { UpdateSubjectBody, SubjectDetailResponse } from "../../../../modules/exam/subjects/education.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const updateSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Subjects"],
      params: Type.Object({ id: Type.String({ format: "uuid" }) }),
      body: UpdateSubjectBody,
      response: { 200: SubjectDetailResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: string }; Body: typeof UpdateSubjectBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof SubjectDetailResponse.static> {
      const { id } = request.params;
      const result = await updateSubjectService(id, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.subjects.update.success),
        data: result.data,
      });
    },
  });
};

export default updateSubjectRoute;
