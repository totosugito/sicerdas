import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { syncPackageQuestionsOrderService } from "../../../../modules/exam/package-questions/services/admin/sync-order.service.ts";
import { SyncPackageQuestionsOrderBody } from "../../../../modules/exam/package-questions/package-questions.schema.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";

const syncPackageQuestionsOrderRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/sync-order",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Questions"],
      body: SyncPackageQuestionsOrderBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof SyncPackageQuestionsOrderBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const result = await syncPackageQuestionsOrderService(request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.package_questions.assign.success),
      });
    },
  });
};

export default syncPackageQuestionsOrderRoute;
