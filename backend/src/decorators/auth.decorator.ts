import type { FastifyInstance } from "fastify";
import auth from "../auth.ts";

export function getAuthInstance(_fastify: FastifyInstance) {
  return auth;
}
