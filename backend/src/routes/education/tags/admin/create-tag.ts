import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createTagService } from "../../../../modules/education/tags/services/create-tag.service.ts";
import { CreateTagBody, TagDetailResponse } from "../../../../modules/education/tags/education.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const createTagRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Tags"],
      body: CreateTagBody,
      response: { 201: TagDetailResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreateTagBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof TagDetailResponse.static> {
      const userId = request.session.user.id;
      const result = await createTagService(request.body, userId);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.education.tags.create.success),
        data: result.data,
      });
    },
  });
};

export default createTagRoute;
