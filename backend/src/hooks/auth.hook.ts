import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getAuthInstance } from "../decorators/auth.decorator.ts";
import { EnumUserRole } from "../db/schema/users/types.ts";

export type UserRole = typeof EnumUserRole[keyof typeof EnumUserRole];

/**
 * A reusable preHandler hook creator to enforce user authentication and role authorization.
 */
export function requireRoles(fastify: FastifyInstance, allowedRoles?: UserRole[]) {
  return async (req: FastifyRequest, res: FastifyReply) => {
    const session = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.unauthorized(req.t(($) => $.user.hook.unauthorized));
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(session.user.role as UserRole)) {
        return res.forbidden(req.t(($) => $.user.hook.forbidden));
      }
    }

    req.setDecorator("session", session);
  };
}
