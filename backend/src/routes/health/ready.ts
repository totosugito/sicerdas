/**
 * @file Readiness Probe Route
 * GET /api/health/ready
 */
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyRequest, FastifyReply } from "fastify";
import { Type } from "@fastify/type-provider-typebox";
import { db } from "../../db/db-pool.ts";
import { sql } from "drizzle-orm";

const ReadinessResponse = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
  checks: Type.Object({
    database: Type.String(),
  }),
  error: Type.Optional(Type.String()),
});

const getReadinessRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/ready",
    method: "GET",
    schema: {
      tags: ["Health"],
      summary: "Readiness probe",
      description: "Checks whether the service and database are ready to accept traffic",
      response: {
        200: ReadinessResponse,
        503: ReadinessResponse,
      },
    },
    handler: async function handler(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      try {
        await db.execute(sql`SELECT 1`);
        return reply.status(200).send({
          status: "ready",
          timestamp: new Date().toISOString(),
          checks: {
            database: "connected",
          },
        });
      } catch (error: any) {
        return reply.status(503).send({
          status: "not_ready",
          timestamp: new Date().toISOString(),
          checks: {
            database: "disconnected",
          },
          error: error?.message || "Database connection failed",
        });
      }
    },
  });
};

export default getReadinessRoute;
