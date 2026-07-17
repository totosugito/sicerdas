import { Session } from '@better-auth/core';
import type { AppLocale } from '../locales/locales.ts';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session;
    i18n: {
      t: (key: string, options?: Record<string, any>) => string;
    };
    t: (selector: (obj: AppLocale) => any, options?: any) => string;
  }

  interface FastifySchema {
    tags?: string[];
    summary?: string;
    description?: string;
  }
}