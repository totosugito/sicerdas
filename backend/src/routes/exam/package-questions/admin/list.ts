import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { packageQuestionListService } from "../../../../modules/exam/package-questions/services/admin/list.service.ts";
import { PackageQuestionListBody, PackageQuestionListResponse } from "../../../../modules/exam/package-questions/package-questions.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const listPackageQuestionsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Questions"],
      body: PackageQuestionListBody,
      response: {
        200: PackageQuestionListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof PackageQuestionListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof PackageQuestionListResponse.static> {
      const result = await packageQuestionListService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.package_questions.list.success),
        data: result.data,
      });
    },
  });
};

export default listPackageQuestionsRoute;
