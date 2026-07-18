import type { FastifyInstance } from "fastify";
import { requireRoles } from "../../../hooks/auth.hook.ts";

async function userHook(fastify: FastifyInstance) {
  fastify.decorateRequest("session");

  fastify.addHook("preHandler", requireRoles(fastify));
}

export default userHook;
