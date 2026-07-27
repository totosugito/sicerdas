import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { deleteSectionService } from "../../../../modules/exam/package-sections/services/admin/delete-section.service.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";

const DeleteSectionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const deleteSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/delete/:id",
    method: "DELETE",
    schema: {
      tags: ["Admin Exam Package Sections"],
      params: DeleteSectionParams,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Params: typeof DeleteSectionParams.static }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = request.params;
      const result = await deleteSectionService(id);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.package_sections.delete.success),
      });
    },
  });
};

export default deleteSectionRoute;
