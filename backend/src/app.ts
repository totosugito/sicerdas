import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AutoLoad from '@fastify/autoload';
import Fastify, { type FastifyServerOptions } from 'fastify';
import fastifyStatic from '@fastify/static';
import i18n from 'fastify-i18n';
import { readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load locale files
// const enMessages = JSON.parse(readFileSync(path.join(__dirname, 'locales', 'en.json'), 'utf-8'));
const idMessages = JSON.parse(readFileSync(path.join(__dirname, 'locales', 'id.json'), 'utf-8'));

export async function buildApp(options?: FastifyServerOptions) {
  const server = Fastify(options);

  // Configure i18n with proper options for fastify-i18n v3
  server.register(i18n, {
    fallbackLocale: 'id',
    messages: {
      // en: enMessages,
      id: idMessages
    }
  });

  // Auto-load plugins
  await server.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    dirNameRoutePrefix: false,
  });

  // Auto-load routes
  server.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    autoHooks: true,
    autoHooksPattern: /\.hook(?:\.ts|\.js|\.cjs|\.mjs)$/i,
    cascadeHooks: true,
    options: {prefix: "/api"},
  });

  // Serve static files
  server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'uploads'),
    prefix: '/uploads/',
    setHeaders: (res, _path) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });

  // Set error handler
  server.setErrorHandler((err, request, reply) => {
    // Skip logging 401 Unauthorized errors as they're expected behavior
    if (err.statusCode !== 401) {
      server.log.error(
        {
          err,
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
          },
        },
        'Unhandled error occurred',
      );
    }

    reply.code(err.statusCode ?? 500);

    let message = 'Internal Server Error';
    if (err.statusCode && err.statusCode < 500) {
      message = err.message;
    }

    return { message };
  });

  // This is used to avoid attacks to find valid routes
  server.setNotFoundHandler(
    {
      preHandler: server.rateLimit({
        max: 4,
        timeWindow: 500,
      }),
    },
    (request, reply) => {
      request.log.warn(
        {
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
          },
        },
        'Resource not found',
      );

      reply.code(404);

      return { message: 'Not Found' };
    },
  );

  return server;
}
