import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";
import {
  CourseIdParams,
  AdminReorderChapterBody,
} from "../../../../modules/course/chapters/chapters.schema.ts";
import { reorderChapterService } from "../../../../modules/course/chapters/services/admin/reorder-chapter.service.ts";

const reorderRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/reorder/:courseId",
    method: "PUT",
    schema: {
      tags: ["Admin Course Chapters"],
      summary: "Reorder chapters in a course",
      params: CourseIdParams,
      body: AdminReorderChapterBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{
        Params: typeof CourseIdParams.static;
        Body: typeof AdminReorderChapterBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const { courseId } = req.params;
      const result = await reorderChapterService(courseId, req.body);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.chapters.reorder.success),
      });
    },
  });
};

export default reorderRoute;
