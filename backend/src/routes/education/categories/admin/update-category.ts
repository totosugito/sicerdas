import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { updateCategoryService } from "../../../../modules/education/categories/services/update-category.service.ts";
import { UpdateCategoryBody, CategoryResponse } from "../../../../modules/education/categories/education.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const updateCategoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Categories"],
      params: Type.Object({ id: Type.String({ format: "uuid" }) }),
      body: UpdateCategoryBody,
      response: { 200: CategoryResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: string }; Body: typeof UpdateCategoryBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CategoryResponse.static> {
      const { id } = request.params;
      const result = await updateCategoryService(id, request.body);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        if (result.statusCode === 409) return reply.badRequest(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.categories.update.success),
        data: result.data,
      });
    },
  });
};

export default updateCategoryRoute;
