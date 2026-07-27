import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { assignPackageQuestionsService } from "../../../../modules/exam/package-questions/services/admin/assign.service.ts";
import { AssignPackageQuestionsBody, AssignPackageQuestionsResponse } from "../../../../modules/exam/package-questions/package-questions.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const assignPackageQuestionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/assign",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Questions"],
      body: AssignPackageQuestionsBody,
      response: {
        200: AssignPackageQuestionsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AssignPackageQuestionsBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof AssignPackageQuestionsResponse.static> {
      const result = await assignPackageQuestionsService(request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.package_questions.assign.success),
        data: result.data,
      });
    },
  });
};

export default assignPackageQuestionsRoute;
