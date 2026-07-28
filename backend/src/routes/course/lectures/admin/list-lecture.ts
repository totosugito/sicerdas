import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  ChapterIdParams,
  LectureListResponse,
} from "../../../../modules/course/lectures/lectures.schema.ts";
import { listLectureService } from "../../../../modules/course/lectures/services/admin/list-lecture.service.ts";

const listRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list/:chapterId",
    method: "GET",
    schema: {
      tags: ["Admin Course Lectures"],
      summary: "List lectures in a chapter",
      params: ChapterIdParams,
      response: {
        200: LectureListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof ChapterIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { chapterId } = req.params;
      const result = await listLectureService(chapterId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectures.list.success),
        data: result.data!,
      });
    },
  });
};

export default listRoute;
