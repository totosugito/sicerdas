import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import { getAuthInstance } from "../../../../decorators/auth.decorator.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

/**
 * User Hook for Client Package Routes
 *
 * This hook ensures that the user is authenticated before accessing
 * protected client package routes.
 */
async function userHook(fastify: FastifyInstance) {
  fastify.decorateRequest("session");

  fastify.addHook("preHandler", async (req, res) => {
    const session = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      const { t } = getTypedI18n(req);
      return res.unauthorized(t(($) => $.user.errors.loginRequired));
    }

    req.setDecorator("session", session);
  });
}

export default userHook;
