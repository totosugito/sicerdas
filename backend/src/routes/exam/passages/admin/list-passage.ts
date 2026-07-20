import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { listPassagesService } from "../../../../modules/exam/passages/services/list-passages.service.ts";
import {
  PassageListBody,
  ListPassagesResponse,
} from "../../../../modules/exam/passages/passages.schema.ts";

const listPassageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Admin Exam Passages"],
      body: PassageListBody,
      response: {
        200: ListPassagesResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof PassageListBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await listPassagesService(request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.passages.list.success),
        data: result.data,
      });
    },
  });
};

export default listPassageRoute;
