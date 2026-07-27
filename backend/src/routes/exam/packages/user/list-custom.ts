import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listCustomService } from "../../../../modules/exam/packages/services/user/list-custom.service.ts";
import { ListCustomQuery, ListCustomResponse } from "../../../../modules/exam/packages/packages.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const listCustomRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-custom",
    method: "GET",
    schema: {
      tags: ["Exam Packages"],
      summary: "List user's generated custom practice packages",
      querystring: ListCustomQuery,
      response: {
        200: ListCustomResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{
        Querystring: typeof ListCustomQuery.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof ListCustomResponse.static> {
      const userId = (req as any).session.user.id;
      const result = await listCustomService(req.query, userId);

      if (!result.success || !result.data || !result.pagination) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.list.success),
        data: result.data,
        pagination: result.pagination,
      });
    },
  });
};

export default listCustomRoute;
