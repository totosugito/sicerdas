import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";
import { LectureIdParams } from "../../../../modules/course/lectures/lectures.schema.ts";
import { deleteLectureService } from "../../../../modules/course/lectures/services/admin/delete-lecture.service.ts";

const deleteRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Course Lectures"],
      summary: "Delete a lecture",
      params: LectureIdParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof LectureIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      const result = await deleteLectureService(id);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectures.delete.success),
      });
    },
  });
};

export default deleteRoute;
