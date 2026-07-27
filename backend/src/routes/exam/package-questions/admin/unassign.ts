import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { unassignPackageQuestionsService } from "../../../../modules/exam/package-questions/services/admin/unassign.service.ts";
import { UnassignPackageQuestionsBody } from "../../../../modules/exam/package-questions/package-questions.schema.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";

const unassignPackageQuestionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/unassign",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Questions"],
      body: UnassignPackageQuestionsBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof UnassignPackageQuestionsBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const result = await unassignPackageQuestionsService(request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.package_questions.unassign.success),
      });
    },
  });
};

export default unassignPackageQuestionsRoute;
