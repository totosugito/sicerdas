import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AdminCreateCourseBody,
  CourseDetailResponse,
} from "../../../../modules/course/courses/courses.schema.ts";
import { createCourseService } from "../../../../modules/course/courses/services/admin/create-course.service.ts";

const createRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Courses"],
      summary: "Create a new course",
      body: AdminCreateCourseBody,
      response: {
        201: CourseDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof AdminCreateCourseBody.static }>,
      reply: FastifyReply,
    ) {
      const userId = req.session.user.id;
      const result = await createCourseService(req.body, userId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: req.t(($) => $.course.courses.create.success),
        data: result.data!,
      });
    },
  });
};

export default createRoute;
