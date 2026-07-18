import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumUserRole } from "../../../db/schema/index.ts";
import { listCategoryService } from "../../../modules/education/services/list-category.service.ts";
import { CategoryListBody, CategoryResponse } from "../../../modules/education/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listCategoryRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Exam Categories"],
      body: CategoryListBody,
      response: { 200: CategoryResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CategoryListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CategoryResponse.static> {
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      const isAdmin = session?.user?.role === EnumUserRole.ADMIN;

      const result = await listCategoryService(request.body, isAdmin);

      if (!result.success || !result.data) {
        return reply.internalServerError(request.t(($) => $.education.categories.list.success));
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.categories.list.success),
        data: result.data,
      });
    },
  });
};

export default listCategoryRoute;
