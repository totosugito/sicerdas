import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { CourseDetailResponse } from "../../../../modules/course/courses/courses.schema.ts";
import { detailCourseService } from "../../../../modules/course/courses/services/admin/detail-course.service.ts";

const ParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const detailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Courses"],
      summary: "Get course details (Admin)",
      params: ParamsSchema,
      response: {
        200: CourseDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof ParamsSchema.static }>,
      reply: FastifyReply,
    ) {
      const result = await detailCourseService(req.params.id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.courses.detail.success),
        data: result.data!,
      });
    },
  });
};

export default detailRoute;
