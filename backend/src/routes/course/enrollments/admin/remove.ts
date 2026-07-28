import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema, BaseResponseSchema } from "../../../../types/response.ts";
import { AdminRemoveEnrollmentBody } from "../../../../modules/course/enrollments/index.ts";
import { removeEnrollmentService } from "../../../../modules/course/enrollments/index.ts";

const removeEnrollmentRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/remove",
    method: "DELETE",
    schema: {
      tags: ["Admin Course Enrollments"],
      body: AdminRemoveEnrollmentBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof AdminRemoveEnrollmentBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await removeEnrollmentService(request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.course.courses.delete.success),
      });
    },
  });
};

export default removeEnrollmentRoute;
