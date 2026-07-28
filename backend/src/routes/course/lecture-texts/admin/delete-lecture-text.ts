import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";
import { LectureTextIdParams } from "../../../../modules/course/lecture-texts/lecture-texts.schema.ts";
import { deleteLectureTextService } from "../../../../modules/course/lecture-texts/services/admin/delete-lecture-text.service.ts";

const deleteRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Course Lecture Texts"],
      summary: "Delete course lecture text article",
      params: LectureTextIdParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Params: typeof LectureTextIdParams.static }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      const result = await deleteLectureTextService(id, req.log);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectureTexts.delete.success),
      });
    },
  });
};

export default deleteRoute;
