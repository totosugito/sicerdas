import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listGradeSimpleService } from "../../../modules/education/grades/services/list-grade-simple.service.ts";
import { GradeSimpleBody, GradeSimpleResponse } from "../../../modules/education/grades/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listGradesSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Education Grades"],
      body: GradeSimpleBody,
      response: { 200: GradeSimpleResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof GradeSimpleBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof GradeSimpleResponse.static> {
      const { page = 1, limit = 1000, isDefault = true } = request.body;
      const result = await listGradeSimpleService(page, limit, isDefault);

      if (!result.success || !result.data) {
        return reply.internalServerError(request.t(($) => $.education.grades.list.error));
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.grades.list.success),
        data: result.data,
      });
    },
  });
};

export default listGradesSimpleRoute;
