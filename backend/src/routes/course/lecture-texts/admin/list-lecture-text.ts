import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  LectureTextListQuery,
  LectureTextListResponse,
} from "../../../../modules/course/lecture-texts/lecture-texts.schema.ts";
import { listLectureTextService } from "../../../../modules/course/lecture-texts/services/admin/list-lecture-text.service.ts";

const listRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "GET",
    schema: {
      tags: ["Admin Course Lecture Texts"],
      summary: "List all course lecture text articles",
      querystring: LectureTextListQuery,
      response: {
        200: LectureTextListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: typeof LectureTextListQuery.static }>,
      reply: FastifyReply,
    ) {
      const result = await listLectureTextService(req.query);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectureTexts.list.success),
        data: result.data!,
      });
    },
  });
};

export default listRoute;
