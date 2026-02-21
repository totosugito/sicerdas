import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { db } from '../../db/db-pool.ts';

async function dbPlugin(fastify: FastifyInstance) {
  fastify.decorate('db', db);
  fastify.addHook('onClose', async () => {
    await db.$client.end();
  });
}

export default fp(dbPlugin, {
  name: 'db-plugin',
});
