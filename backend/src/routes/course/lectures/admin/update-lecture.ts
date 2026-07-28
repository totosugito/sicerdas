import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  LectureIdParams,
  AdminUpdateLectureBody,
  LectureDetailResponse,
} from "../../../../modules/course/lectures/lectures.schema.ts";
import { updateLectureService } from "../../../../modules/course/lectures/services/admin/update-lecture.service.ts";

const updateRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Course Lectures"],
      summary: "Update lecture details",
      params: LectureIdParams,
      body: AdminUpdateLectureBody,
      response: {
        200: LectureDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{
        Params: typeof LectureIdParams.static;
        Body: typeof AdminUpdateLectureBody.static;
      }>,
      reply: FastifyReply,
    ) {
      const { id } = req.params;
      const result = await updateLectureService(id, req.body);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.lectures.update.success),
        data: result.data!,
      });
    },
  });
};

export default updateRoute;
