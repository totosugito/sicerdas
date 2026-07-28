import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AdminUpdateCourseBody,
  CourseDetailResponse,
} from "../../../../modules/course/courses/courses.schema.ts";
import { updateCourseService } from "../../../../modules/course/courses/services/admin/update-course.service.ts";

const ParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const updateRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Courses"],
      summary: "Update an existing course",
      params: ParamsSchema,
      body: AdminUpdateCourseBody,
      response: {
        200: CourseDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{
        Params: typeof ParamsSchema.static;
        Body: typeof AdminUpdateCourseBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const result = await updateCourseService(req.params.id, req.body);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.courses.update.success),
        data: result.data!,
      });
    },
  });
};

export default updateRoute;
