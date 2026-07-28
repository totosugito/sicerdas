import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  LectureIdParams,
  LectureDetailResponse,
} from "../../../../modules/course/lectures/lectures.schema.ts";
import { detailLectureService } from "../../../../modules/course/lectures/services/admin/detail-lecture.service.ts";

const detailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Course Lectures"],
      summary: "Get lecture details",
      params: LectureIdParams,
      response: {
        200: LectureDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof LectureIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      const result = await detailLectureService(id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectures.detail.success),
        data: result.data!,
      });
    },
  });
};

export default detailRoute;
