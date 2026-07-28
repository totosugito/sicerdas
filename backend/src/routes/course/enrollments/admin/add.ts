import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  AdminAddEnrollmentBody,
  EnrollmentDetailResponse,
} from "../../../../modules/course/enrollments/index.ts";
import { addEnrollmentService } from "../../../../modules/course/enrollments/index.ts";

const addEnrollmentRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/add",
    method: "POST",
    schema: {
      tags: ["Admin Course Enrollments"],
      body: AdminAddEnrollmentBody,
      response: {
        201: EnrollmentDetailResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AdminAddEnrollmentBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await addEnrollmentService(request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.course.courses.create.success),
        data: result.data!,
      });
    },
  });
};

export default addEnrollmentRoute;
