import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type { AppLocale } from '../../locales/locales.ts';

function getPath(selector: (obj: any) => any): string {
  const parts: string[] = [];
  const proxyHandler: ProxyHandler<any> = {
    get(_, prop) {
      if (typeof prop === 'string') {
        parts.push(prop);
      }
      return new Proxy({}, proxyHandler);
    },
  };

  const proxy = new Proxy({}, proxyHandler);
  selector(proxy);
  return parts.join('.');
}

async function i18nPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('t', function (selector: (obj: AppLocale) => any, options?: any) {
    const key = getPath(selector);
    // @ts-ignore - fastify-i18n adds i18n to request
    return this.i18n.t(key, options);
  });
}

export default fp(i18nPlugin, {
  name: 'i18n-typed-decorator',
  dependencies: [],
});
