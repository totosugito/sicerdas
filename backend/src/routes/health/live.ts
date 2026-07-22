/**
 * @file Liveness Probe Route
 * GET /api/health/live
 */
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyRequest, FastifyReply } from "fastify";
import { Type } from "@fastify/type-provider-typebox";

const LivenessResponse = Type.Object({
  status: Type.Literal("ok"),
  timestamp: Type.String(),
});

const getLivenessRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/live",
    method: "GET",
    schema: {
      tags: ["Health"],
      summary: "Liveness probe",
      description: "Returns 200 OK if the service process is alive",
      response: {
        200: LivenessResponse,
      },
    },
    handler: async function handler(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      return reply.status(200).send({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    },
  });
};

export default getLivenessRoute;
