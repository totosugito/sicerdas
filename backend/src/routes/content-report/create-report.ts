import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { createReportService } from "../../modules/content-report/services/create-report.service.ts";
import { CreateReportBody, CreateReportResponse } from "../../modules/content-report/content-report.schema.ts";
import { ErrorResponseSchema } from "../../types/response.ts";

const createReportRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/create",
    method: "POST",
    schema: {
      tags: ["V1/Report"],
      summary: "Create a new report",
      description: "Submit a new user report for content",
      body: CreateReportBody,
      response: {
        200: CreateReportResponse,
        "4xx": ErrorResponseSchema,
      },
    },
    handler: async function handler(
      req: FastifyRequest<{ Body: typeof CreateReportBody.static }>,
      reply: FastifyReply,
    ): Promise<typeof CreateReportResponse.static> {
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      const reporterId = session?.user?.id || null;

      const result = await createReportService(req.body, reporterId);

      if (!result.success || !result.data) {
        const message = req.t(result.errorKey!);
        return reply.internalServerError(message);
      }

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.report.create.success),
        data: result.data,
      });
    },
  });
};

export default createReportRoute;
