import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";
import { deleteCourseService } from "../../../../modules/course/courses/services/admin/delete-course.service.ts";

const ParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const deleteRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Courses"],
      summary: "Delete a course",
      params: ParamsSchema,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof ParamsSchema.static }>,
      reply: FastifyReply,
    ) {
      const result = await deleteCourseService(req.params.id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.courses.delete.success),
      });
    },
  });
};

export default deleteRoute;
