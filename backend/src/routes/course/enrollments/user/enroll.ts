import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  UserCourseIdParams,
  EnrollmentDetailResponse,
} from "../../../../modules/course/enrollments/index.ts";
import { enrollCourseService } from "../../../../modules/course/enrollments/index.ts";

const enrollRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/enroll/:courseId",
    method: "POST",
    schema: {
      tags: ["User Course Enrollments"],
      params: UserCourseIdParams,
      response: {
        200: EnrollmentDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof UserCourseIdParams.static }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const result = await enrollCourseService(request.params.courseId, userId);

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

export default enrollRoute;
