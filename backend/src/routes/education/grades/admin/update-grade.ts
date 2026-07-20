import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { updateGradeService } from "../../../../modules/education/grades/services/admin/update-grade.service.ts";
import { UpdateGradeBody, GradeDetailResponse } from "../../../../modules/education/grades/education.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const updateGradeRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Education Grades"],
      params: Type.Object({ id: Type.Number() }),
      body: UpdateGradeBody,
      response: { 200: GradeDetailResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: number }; Body: typeof UpdateGradeBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof GradeDetailResponse.static> {
      const { id } = request.params;
      const result = await updateGradeService(id, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.grades.update.success),
        data: result.data,
      });
    },
  });
};

export default updateGradeRoute;
