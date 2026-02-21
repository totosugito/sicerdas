import type { FastifyRequest } from 'fastify';
import type { db } from '../db/db-pool.ts';

export function getDbDecorator(request: FastifyRequest) {
  return request.getDecorator<typeof db>('db');
}
