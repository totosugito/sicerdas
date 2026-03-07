import type { FastifyRequest } from 'fastify';
import type { AppLocale } from '../locales/locales.ts';

/**
 * Utility to extract the string path from a selector function using a Proxy.
 * Example: $ => $.auth.login -> "auth.login"
 */
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

/**
 * Returns a type-safe translation function for the given Fastify request.
 * Usage: 
 * const { t } = getTypedI18n(req);
 * t($ => $.auth.emailAndPasswordRequired)
 */
export function getTypedI18n(req: FastifyRequest) {
    const t = (selector: (obj: AppLocale) => any, options?: any): string => {
        const key = getPath(selector);
        // @ts-ignore - fastify-i18n adds i18n to request
        return req.i18n.t(key, options);
    };

    return { t };
}
