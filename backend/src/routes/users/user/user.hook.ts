import type { FastifyInstance } from "fastify";
import { requireRoles } from "../../../hooks/auth.hook.ts";

async function userHook(fastify: FastifyInstance) {
  fastify.decorateRequest("session");

  // Require standard user authentication without restricting to specific roles
  fastify.addHook("preHandler", requireRoles(fastify));
}

export default userHook;
