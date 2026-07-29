import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  LectureTextSimpleQuery,
  LectureTextSimpleListResponse,
} from "../../../../modules/course/lecture-texts/lecture-texts.schema.ts";
import { listSimpleLectureTextService } from "../../../../modules/course/lecture-texts/services/admin/list-simple-lecture-text.service.ts";

const listSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "GET",
    schema: {
      tags: ["Admin Course Lecture Texts"],
      summary: "List all course lecture text articles as value and label",
      querystring: LectureTextSimpleQuery,
      response: {
        200: LectureTextSimpleListResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Querystring: typeof LectureTextSimpleQuery.static }>,
      reply: FastifyReply,
    ) {
      const result = await listSimpleLectureTextService(req.query);

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

export default listSimpleRoute;
