import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  CourseIdParams,
  ChapterListResponse,
} from "../../../../modules/course/chapters/chapters.schema.ts";
import { listChapterService } from "../../../../modules/course/chapters/services/admin/list-chapter.service.ts";

const listRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list/:courseId",
    method: "GET",
    schema: {
      tags: ["Admin Course Chapters"],
      summary: "List chapters for a course",
      params: CourseIdParams,
      response: {
        200: ChapterListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof CourseIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { courseId } = req.params;
      const result = await listChapterService(courseId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.chapters.list.success),
        data: result.data!,
      });
    },
  });
};

export default listRoute;
