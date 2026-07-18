import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listTagSimpleService } from "../../../modules/education/tags/services/list-tag-simple.service.ts";
import { TagSimpleBody, TagSimpleResponse } from "../../../modules/education/tags/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listTagsSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Education Tags"],
      body: TagSimpleBody,
      response: { 200: TagSimpleResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof TagSimpleBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof TagSimpleResponse.static> {
      const { page = 1, limit = 1000 } = request.body;
      const result = await listTagSimpleService(page, limit);

      if (!result.success || !result.data) {
        return reply.internalServerError(request.t(($) => $.education.tags.list.error));
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.tags.list.success),
        data: result.data,
      });
    },
  });
};

export default listTagsSimpleRoute;
