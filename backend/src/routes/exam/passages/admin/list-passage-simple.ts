import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import { listPassagesSimpleService } from "../../../../modules/exam/passages/services/list-passages-simple.service.ts";
import {
  PassageSimpleListBody,
  ListPassagesSimpleResponse,
} from "../../../../modules/exam/passages/passages.schema.ts";

const listPassagesSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Admin Exam Passages"],
      body: PassageSimpleListBody,
      response: {
        200: ListPassagesSimpleResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof PassageSimpleListBody.static }>,
      reply: FastifyReply,
    ) {
      const result = await listPassagesSimpleService(request.body);

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

export default listPassagesSimpleRoute;
