import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  UserLectureIdParams,
  CompleteLectureResponse,
  completeLectureService,
} from "../../../../modules/course/user-progress/index.ts";

const completeRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/lecture/:lectureId/complete",
    method: "POST",
    schema: {
      tags: ["User Course Progress"],
      params: UserLectureIdParams,
      response: {
        200: CompleteLectureResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof UserLectureIdParams.static }>,
      reply: FastifyReply,
    ) {
      const userId = request.session.user.id;
      const result = await completeLectureService(request.params.lectureId, userId);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        if (result.statusCode === 403) {
          return reply.forbidden(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.lectures.detail.success),
        data: result.data!,
      });
    },
  });
};

export default completeRoute;
