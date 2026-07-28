import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  LectureTextIdParams,
  LectureTextDetailResponse,
} from "../../../../modules/course/lecture-texts/lecture-texts.schema.ts";
import { detailLectureTextService } from "../../../../modules/course/lecture-texts/services/admin/detail-lecture-text.service.ts";

const detailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Admin Course Lecture Texts"],
      summary: "Get course lecture text article detail",
      params: LectureTextIdParams,
      response: {
        200: LectureTextDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof LectureTextIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      const result = await detailLectureTextService(id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectureTexts.detail.success),
        data: result.data!,
      });
    },
  });
};

export default detailRoute;
