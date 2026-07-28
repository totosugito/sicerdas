import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  UserCourseIdParams,
  SyllabusResponse,
  getSyllabusService,
} from "../../../../modules/course/user-progress/index.ts";

const syllabusRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/syllabus/:courseId",
    method: "GET",
    schema: {
      tags: ["User Course Progress"],
      params: UserCourseIdParams,
      response: {
        200: SyllabusResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof UserCourseIdParams.static }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const result = await getSyllabusService(request.params.courseId, userId);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.courses.detail.success),
        data: result.data!,
      });
    },
  });
};

export default syllabusRoute;
