import FastifyMultipart, { type FastifyMultipartOptions } from '@fastify/multipart';
import fp from 'fastify-plugin';

export const autoConfig: FastifyMultipartOptions = {
   limits: {
      fieldNameSize: 100,
      fieldSize: 1024 * 100,
      fields: 10,
      fileSize: 10 * 1024 * 1024,
      files: 10,
      parts: 1000,
   },
};

export default fp(FastifyMultipart);
