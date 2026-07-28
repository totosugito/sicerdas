import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import {
  CourseListQuery,
  CourseListResponse,
} from "../../../modules/course/courses/courses.schema.ts";
import { listCourseService } from "../../../modules/course/courses/services/admin/list-course.service.ts";

const publicListRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "GET",
    schema: {
      tags: ["Public Courses"],
      summary: "List published courses",
      querystring: CourseListQuery,
      response: {
        200: CourseListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: typeof CourseListQuery.static }>,
      reply: FastifyReply,
    ) {
      const result = await listCourseService(req.query, true);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.courses.list.success),
        data: result.data!,
      });
    },
  });
};

export default publicListRoute;
