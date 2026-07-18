import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createSubjectService } from "../../../../modules/exam/subjects/services/create-subject.service.ts";
import { CreateSubjectBody, SubjectDetailResponse } from "../../../../modules/exam/subjects/education.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const createSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Subjects"],
      body: CreateSubjectBody,
      response: { 201: SubjectDetailResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreateSubjectBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof SubjectDetailResponse.static> {
      const userId = request.session.user.id;
      const result = await createSubjectService(request.body, userId);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.exam.subjects.create.success),
        data: result.data,
      });
    },
  });
};

export default createSubjectRoute;
