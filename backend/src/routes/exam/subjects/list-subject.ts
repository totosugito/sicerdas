import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumUserRole } from "../../../db/schema/index.ts";
import { listSubjectService } from "../../../modules/exam/subjects/services/list-subject.service.ts";
import { SubjectListBody, SubjectListResponse } from "../../../modules/exam/subjects/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listSubjectRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Exam Subjects"],
      body: SubjectListBody,
      response: { 200: SubjectListResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof SubjectListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof SubjectListResponse.static> {
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      const isAdmin = session?.user?.role === EnumUserRole.ADMIN;

      const result = await listSubjectService(request.body, isAdmin);

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

export default listSubjectRoute;
