import { Session } from '@better-auth/core';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session;
    i18n: {
      t: (key: string, options?: Record<string, any>) => string;
    };
  }

  interface FastifySchema {
    tags?: string[];
    summary?: string;
    description?: string;
  }
}