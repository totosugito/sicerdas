import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  UserCourseListQuery,
  UserCourseListResponse,
} from "../../../../modules/course/enrollments/index.ts";
import { listUserCoursesService } from "../../../../modules/course/enrollments/index.ts";
import { EnumEnrollmentStatus } from "../../../../db/schema/course/enums.ts";

const activeCoursesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/active",
    method: "GET",
    schema: {
      tags: ["User Course Enrollments"],
      querystring: UserCourseListQuery,
      response: {
        200: UserCourseListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Querystring: typeof UserCourseListQuery.static }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const result = await listUserCoursesService(userId, EnumEnrollmentStatus.ACTIVE, request.query);

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.courses.detail.success),
        data: result.data || [],
        pagination: result.pagination!,
      });
    },
  });
};

export default activeCoursesRoute;
