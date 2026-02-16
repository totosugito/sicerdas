import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance } from 'fastify';
import { getAuthInstance } from '../../../../decorators/auth.decorator.ts';
import { EnumUserRole } from '../../../../db/schema/enum-auth.ts';

async function adminHook(fastify: FastifyInstance) {
  fastify.decorateRequest('session');

  fastify.addHook('preHandler', async (req, res) => {
    const session = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.unauthorized(req.i18n.t('admin.hook.unauthorized'));
    }

    if (session?.user?.role !== EnumUserRole.ADMIN) {
      return res.forbidden(req.i18n.t('admin.hook.forbidden'));
    }

    req.setDecorator('session', session);
  });
}

export default adminHook;
