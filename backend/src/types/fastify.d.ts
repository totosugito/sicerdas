import { Session } from '@better-auth/core';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session;
    i18n: {
      t: (key: string, options?: Record<string, any>) => string;
    };
  }
}