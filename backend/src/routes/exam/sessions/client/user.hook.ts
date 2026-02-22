import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance } from 'fastify';
import { getAuthInstance } from '../../../../decorators/auth.decorator.ts';

async function userHook(fastify: FastifyInstance) {
  fastify.decorateRequest('session');

  fastify.addHook('preHandler', async (req, res) => {
    const session = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.unauthorized(req.i18n.t('user.errors.loginRequired'));
    }

    req.setDecorator('session', session);
  });
}

export default userHook;