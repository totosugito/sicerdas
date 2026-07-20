import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { appLatestService } from "../../modules/app/services/app-latest.service.ts";
import { AppLatestBody, AppLatestResponse } from "../../modules/app/app-latest.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const appLatestRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/app-latest",
    method: "POST",
    schema: {
      tags: ["V1/App"],
      body: AppLatestBody,
      response: {
        200: AppLatestResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof AppLatestBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof AppLatestResponse.static> {
      const { dbVersion } = req.body;

      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const userId = session?.user?.id || null;

      const result = await appLatestService(dbVersion, userId);

      if (!result.success || !result.data) {
        return reply.internalServerError(req.t(($) => $.version.notFound));
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.version.latestSuccess),
        data: result.data,
      });
    },
  });
};

export default appLatestRoute;
