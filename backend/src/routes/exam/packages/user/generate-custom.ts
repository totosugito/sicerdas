import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { generateCustomService } from "../../../../modules/exam/packages/services/user/generate-custom.service.ts";
import { GenerateCustomBody, GenerateCustomResponse } from "../../../../modules/exam/packages/packages.schema.ts";
import { ErrorResponseSchema } from "../../../../types/response.ts";

const generateCustomRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/generate-custom",
    method: "POST",
    schema: {
      tags: ["Exam Packages"],
      summary: "Generate a custom practice package",
      description: "Creates a new private exam package based on specific grade and tags",
      body: GenerateCustomBody,
      response: {
        201: GenerateCustomResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof GenerateCustomBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof GenerateCustomResponse.static> {
      const userId = (req as any).session.user.id;
      const result = await generateCustomService(req.body, userId);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        if (result.statusCode === 404) return reply.notFound(message);
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: req.t(($) => $.exam.packages.generateCustom.success),
        data: result.data,
      });
    },
  });
};

export default generateCustomRoute;
