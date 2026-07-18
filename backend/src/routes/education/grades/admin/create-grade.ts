import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createGradeService } from "../../../../modules/education/grades/services/create-grade.service.ts";
import { CreateGradeBody, GradeDetailResponse } from "../../../../modules/education/grades/education.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const createGradeRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Education Grades"],
      body: CreateGradeBody,
      response: { 201: GradeDetailResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreateGradeBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof GradeDetailResponse.static> {
      const userId = request.session.user.id;
      const result = await createGradeService(request.body, userId);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.education.grades.create.success),
        data: result.data,
      });
    },
  });
};

export default createGradeRoute;
