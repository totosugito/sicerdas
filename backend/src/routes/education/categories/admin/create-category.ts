import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createCategoryService } from "../../../../modules/education/categories/services/create-category.service.ts";
import { CreateCategoryBody, CreateCategoryResponse } from "../../../../modules/education/categories/education.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const createCategoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Categories"],
      body: CreateCategoryBody,
      response: { 201: CreateCategoryResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreateCategoryBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CreateCategoryResponse.static> {
      const userId = request.session.user.id;
      const result = await createCategoryService(request.body, userId);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.education.categories.create.success),
        data: result.data,
      });
    },
  });
};

export default createCategoryRoute;
