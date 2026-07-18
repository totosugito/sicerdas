import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listSubjectSimpleService } from "../../../modules/exam/subjects/services/list-subject-simple.service.ts";
import { SubjectSimpleBody, SubjectSimpleResponse } from "../../../modules/exam/subjects/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listSubjectsSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Exam Subjects"],
      body: SubjectSimpleBody,
      response: { 200: SubjectSimpleResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof SubjectSimpleBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof SubjectSimpleResponse.static> {
      const { search, page = 1, limit = 1000 } = request.body;
      const result = await listSubjectSimpleService(search, page, limit);

      if (!result.success || !result.data) {
        return reply.internalServerError(request.t(($) => $.exam.subjects.list.error));
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.subjects.list.success),
        data: result.data,
      });
    },
  });
};

export default listSubjectsSimpleRoute;
