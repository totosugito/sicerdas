import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AutoLoad from '@fastify/autoload';
import Fastify, { type FastifyServerOptions } from 'fastify';
import fastifyStatic from '@fastify/static';
import i18n from 'fastify-i18n';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadLocaleMessages(locale: string) {
  const localeDir = path.join(__dirname, 'locales', locale);
  const messages = {};

  // Read all JSON files in the locale folder
  fs.readdirSync(localeDir).forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(localeDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      Object.assign(messages, jsonData);
    }
  });

  return messages;
}

export async function buildApp(options?: FastifyServerOptions) {
  const server = Fastify(options);

  // Configure i18n with proper options for fastify-i18n v3
  const idMessages = loadLocaleMessages('id');
  server.register(i18n, {
    fallbackLocale: 'id',
    messages: {
      id: idMessages
    },
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
  server.setErrorHandler((error, request, reply) => {
    // Type guard to check if error has expected properties
    const isErrorWithProps = (
      err: unknown
    ): err is { statusCode?: number; code?: number; message?: string } =>
      err !== null && typeof err === 'object';

    // Skip logging 401 Unauthorized errors as they're expected behavior
    if (isErrorWithProps(error) && error.statusCode !== 401) {
      server.log.error(
        {
          err: error,
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

    const statusCode = isErrorWithProps(error)
      ? error.statusCode ?? error.code ?? 500
      : 500;

    reply.code(statusCode);

    let message = 'Internal Server Error';
    if (isErrorWithProps(error) && error.statusCode && error.statusCode < 500) {
      message = error.message ?? message;
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
