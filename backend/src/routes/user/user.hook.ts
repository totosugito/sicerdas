import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance } from 'fastify';
import { getAuthInstance } from '../../decorators/auth.decorator.ts';

async function userHook(fastify: FastifyInstance) {
  fastify.decorateRequest('session');

  fastify.addHook('preHandler', async (req, res) => {
    const session = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.unauthorized(req.i18n.t('user.errors.loginRequired'));
    }

    // Check if the route has an ID parameter and verify it matches the user's ID
    if (req.params && typeof req.params === 'object' && 'id' in req.params) {
      const requestedUserId = (req.params as { id: string }).id;
      if (requestedUserId !== session.user.id) {
        return res.forbidden(req.i18n.t('user.errors.accessDenied'));
      }
    }

    req.setDecorator('session', session);
  });
}

export default userHook;