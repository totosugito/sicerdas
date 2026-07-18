import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { subjectStatsService } from "../../../modules/exam/user-stats/services/subject-stats.service.ts";
import { SubjectStatsBody, SubjectStatsResponse } from "../../../modules/exam/user-stats/user-stats.schema.ts";

const getSubjectStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/subjects",
    method: "POST",
    schema: {
      tags: ["Client Exam Analytics"],
      body: SubjectStatsBody,
      response: { 200: SubjectStatsResponse },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof SubjectStatsBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof SubjectStatsResponse.static> {
      const userId = (request as any).session.user.id;
      const result = await subjectStatsService(userId, request.body);

      if (!result.success || !result.data) {
        return reply.internalServerError(request.t(($) => $.exam.user_stats.subjects.error));
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.user_stats.subjects.success),
        data: result.data,
      });
    },
  });
};

export default getSubjectStatsRoute;
