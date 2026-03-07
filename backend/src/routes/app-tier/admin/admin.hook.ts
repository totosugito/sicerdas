import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance } from 'fastify';
import { getAuthInstance } from '../../../decorators/auth.decorator.ts';
import { EnumUserRole } from '../../../db/schema/user/types.ts';
import { getTypedI18n } from '../../../utils/i18n-typed.ts';

async function adminHook(fastify: FastifyInstance) {
  fastify.decorateRequest('session');

  fastify.addHook('preHandler', async (req, res) => {
    const session = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      const { t } = getTypedI18n(req);
      return res.unauthorized(t($ => $.admin.hook.unauthorized));
    }

    if (session?.user?.role !== EnumUserRole.ADMIN) {
      const { t } = getTypedI18n(req);
      return res.forbidden(t($ => $.admin.hook.forbidden));
    }

    req.setDecorator('session', session);
  });
}

export default adminHook;
