import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponseSchema } from "../../../../types/response.ts";
import {
  CreatePackageBody,
  CreatePackageResponse,
} from "../../../../modules/exam/packages/packages.schema.ts";
import { createPackageService } from "../../../../modules/exam/packages/services/admin/create-package.service.ts";

const createPackageRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["Admin Exam Packages"],
      body: CreatePackageBody,
      response: {
        201: CreatePackageResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      request: FastifyRequest<{ Body: typeof CreatePackageBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CreatePackageResponse.static> {
      const userId = request.session.user.id;

      const result = await createPackageService(request.body, userId);

      if (!result.success) {
        const message = request.t(result.errorKey!);
        if (result.statusCode === 404) {
          return reply.notFound(message);
        }
        return reply.badRequest(message);
      }

      return reply.status(201).send({
        success: true,
        message: request.t(($) => $.exam.packages.create.success),
        data: result.data!,
      });
    },
  });
};

export default createPackageRoute;
