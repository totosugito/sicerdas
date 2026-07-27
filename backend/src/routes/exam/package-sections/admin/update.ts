import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { updateSectionService } from "../../../../modules/exam/package-sections/services/admin/update-section.service.ts";
import { UpdateSectionBody } from "../../../../modules/exam/package-sections/package-sections.schema.ts";
import { BaseResponseSchema, ErrorResponseSchema } from "../../../../types/response.ts";

const UpdateSectionParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});

const updateSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/update/:id",
    method: "PUT",
    schema: {
      tags: ["Admin Exam Package Sections"],
      params: UpdateSectionParams,
      body: UpdateSectionBody,
      response: {
        200: BaseResponseSchema,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{
        Params: typeof UpdateSectionParams.static;
        Body: typeof UpdateSectionBody.static;
      }>,
      reply: FastifyReply,
    ): Promise<typeof BaseResponseSchema.static> {
      const { id } = request.params;
      const result = await updateSectionService(id, request.body);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(200).send({
        success: true,
        message: request.t(($) => $.exam.package_sections.update.success),
      });
    },
  });
};

export default updateSectionRoute;
