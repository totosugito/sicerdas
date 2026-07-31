import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../types/response.ts";
import { CourseFilterParamsResponse } from "../../../modules/course/courses/courses.schema.ts";
import { filterParamsService } from "../../../modules/course/courses/services/filter-params.service.ts";

const courseFilterParamsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/filter-params",
    method: "GET",
    schema: {
      tags: ["Public Courses"],
      summary: "Get filter parameters for courses",
      description: "Get all education categories and their grades that have published courses",
      response: {
        200: CourseFilterParamsResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof CourseFilterParamsResponse.static> {
      const result = await filterParamsService();

      if (!result.success) {
        const message = req.t(result.errorKey!);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.course.courses.list.success),
        data: result.data!,
      });
    },
  });
};

export default courseFilterParamsRoute;
