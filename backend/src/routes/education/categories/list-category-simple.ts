import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { listCategorySimpleService } from "../../../modules/education/categories/services/list-category-simple.service.ts";
import { CategorySimpleBody, CategorySimpleResponse } from "../../../modules/education/categories/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listCategoriesSimpleRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-simple",
    method: "POST",
    schema: {
      tags: ["Exam Categories"],
      body: CategorySimpleBody,
      response: { 200: CategorySimpleResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CategorySimpleBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CategorySimpleResponse.static> {
      const { page = 1, limit = 1000 } = request.body;

      const result = await listCategorySimpleService(page, limit);

      if (!result.success || !result.data) {
        return reply.internalServerError(request.t(($) => $.education.categories.list.error));
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.categories.list.success),
        data: result.data,
      });
    },
  });
};

export default listCategoriesSimpleRoute;
