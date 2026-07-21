import type { FastifyInstance } from 'fastify';
import { EnumUserRole } from '../../../../db/schema/user/types.ts';
import { requireRoles } from '../../../../hooks/auth.hook.ts';

async function adminHook(fastify: FastifyInstance) {
  fastify.decorateRequest('session');

  fastify.addHook('preHandler', requireRoles(fastify, [EnumUserRole.ADMIN]));
}

export default adminHook;
