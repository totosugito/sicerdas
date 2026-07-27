import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createSectionService } from "../../../../modules/exam/package-sections/services/admin/create-section.service.ts";
import { CreateSectionBody, CreateSectionResponse } from "../../../../modules/exam/package-sections/package-sections.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const createSectionRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Package Sections"],
      body: CreateSectionBody,
      response: {
        201: CreateSectionResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreateSectionBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CreateSectionResponse.static> {
      const userId = request.session.user.id;
      const result = await createSectionService(request.body, userId);

      if (!result.success || !result.data) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.exam.package_sections.create.success),
        data: {
          id: result.data.id,
        },
      });
    },
  });
};

export default createSectionRoute;
