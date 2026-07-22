/**
 * @file System Health Status Route
 * GET /api/health
 */
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyRequest, FastifyReply } from "fastify";
import { Type } from "@fastify/type-provider-typebox";
import { db } from "../../db/db-pool.ts";
import { sql } from "drizzle-orm";

const HealthCheckResponse = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
  uptime: Type.Number(),
  environment: Type.String(),
  checks: Type.Object({
    database: Type.Object({
      status: Type.String(),
      latencyMs: Type.Number(),
    }),
  }),
});

const getHealthStatusRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/",
    method: "GET",
    schema: {
      tags: ["Health"],
      summary: "Get system health status",
      description: "Returns overall system health including database connectivity and uptime",
      response: {
        200: HealthCheckResponse,
        503: HealthCheckResponse,
      },
    },
    handler: async function handler(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const startTime = Date.now();
      let dbStatus = "up";
      let dbLatency = 0;

      try {
        await db.execute(sql`SELECT 1`);
        dbLatency = Date.now() - startTime;
      } catch (_error) {
        dbStatus = "down";
      }

      const isHealthy = dbStatus === "up";
      const statusCode = isHealthy ? 200 : 503;

      return reply.status(statusCode).send({
        status: isHealthy ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        checks: {
          database: {
            status: dbStatus,
            latencyMs: dbLatency,
          },
        },
      });
    },
  });
};

export default getHealthStatusRoute;
