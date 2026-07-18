import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { EnumUserRole } from "../../../db/schema/index.ts";
import { detailTagService } from "../../../modules/education/tags/services/detail-tag.service.ts";
import { TagDetailResponse } from "../../../modules/education/tags/education.schema.ts";
import { ErrorResponseSchema } from "../../../types/response.ts";

const detailTagRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Exam Tags"],
      params: Type.Object({ id: Type.String({ format: "uuid" }) }),
      response: { 200: TagDetailResponse, "4xx": ErrorResponseSchema },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ): Promise<typeof TagDetailResponse.static> {
      const { id } = request.params;
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      const isAdmin = session?.user?.role === EnumUserRole.ADMIN;

      const result = await detailTagService(id, isAdmin);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.education.tags.detail.success),
        data: result.data,
      });
    },
  });
};

export default detailTagRoute;
