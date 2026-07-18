import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumUserRole } from "../../../db/schema/index.ts";
import { listTagService } from "../../../modules/education/tags/services/list-tag.service.ts";
import { TagListBody, TagListResponse } from "../../../modules/education/tags/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const listTagRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Exam Tags"],
      body: TagListBody,
      response: { 200: TagListResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof TagListBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof TagListResponse.static> {
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      const isAdmin = session?.user?.role === EnumUserRole.ADMIN;

      const result = await listTagService(request.body, isAdmin);

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

export default listTagRoute;
