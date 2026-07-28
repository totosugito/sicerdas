import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AdminCourseIdParams,
  AdminListEnrollmentsQuery,
  AdminListEnrollmentsResponse,
} from "../../../../modules/course/enrollments/index.ts";
import { listEnrollmentsService } from "../../../../modules/course/enrollments/index.ts";

const listEnrollmentsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list/:courseId",
    method: "GET",
    schema: {
      tags: ["Admin Course Enrollments"],
      params: AdminCourseIdParams,
      querystring: AdminListEnrollmentsQuery,
      response: {
        200: AdminListEnrollmentsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof AdminCourseIdParams.static;
        Querystring: typeof AdminListEnrollmentsQuery.static;
      }>,
      reply: FastifyReply,
    ) {
      const result = await listEnrollmentsService(request.params.courseId, request.query);

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.courses.detail.success),
        data: result.data || [],
        pagination: result.pagination!,
      });
    },
  });
};

export default listEnrollmentsRoute;
