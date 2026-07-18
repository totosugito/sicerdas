import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listGradeService } from "../../../modules/education/grades/services/list-grade.service.ts";
import { GradeListBody, GradeResponse } from "../../../modules/education/grades/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listGradeRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Education Grades"],
      body: GradeListBody,
      response: { 200: GradeResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof GradeListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof GradeResponse.static> {
      const result = await listGradeService(request.body);

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

export default listGradeRoute;
