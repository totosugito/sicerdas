import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";
import {
  ChapterIdParams,
  AdminReorderLectureBody,
} from "../../../../modules/course/lectures/lectures.schema.ts";
import { reorderLectureService } from "../../../../modules/course/lectures/services/admin/reorder-lecture.service.ts";

const reorderRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/reorder/:chapterId",
    method: "PUT",
    schema: {
      tags: ["Admin Course Lectures"],
      summary: "Reorder lectures in a chapter",
      params: ChapterIdParams,
      body: AdminReorderLectureBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{
        Params: typeof ChapterIdParams.static;
        Body: typeof AdminReorderLectureBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const { chapterId } = req.params;
      const result = await reorderLectureService(chapterId, req.body);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectures.reorder.success),
      });
    },
  });
};

export default reorderRoute;
