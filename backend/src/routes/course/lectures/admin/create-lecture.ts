import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AdminCreateLectureBody,
  LectureDetailResponse,
} from "../../../../modules/course/lectures/lectures.schema.ts";
import { createLectureService } from "../../../../modules/course/lectures/services/admin/create-lecture.service.ts";

const createRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Course Lectures"],
      summary: "Create a new lecture",
      body: AdminCreateLectureBody,
      response: {
        201: LectureDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof AdminCreateLectureBody.static }>,
      reply: FastifyReply,
    ) {
      const userId = req.session.user.id;
      const result = await createLectureService(req.body, userId);

      if (!result.success) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: req.t(($) => $.course.lectures.create.success),
        data: result.data!,
      });
    },
  });
};

export default createRoute;
