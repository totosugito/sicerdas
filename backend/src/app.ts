import path from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";
import Fastify, { type FastifyServerOptions } from "fastify";
import fastifyStatic from "@fastify/static";
import i18n from "fastify-i18n";
import { defaultLocale } from "./locales/locales.ts";
import fs from "fs";
import envConfig from "./config/env.config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildApp(options?: FastifyServerOptions) {
  const server = Fastify({
    ...options,
    trustProxy: true,
  });

  // Configure i18n with proper options for fastify-i18n v3
  server.register(i18n, {
    fallbackLocale: "id",
    messages: {
      id: defaultLocale,
    },
  });

  // Auto-load plugins
  await server.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    dirNameRoutePrefix: false,
  });

  // Auto-load routes
  server.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    autoHooks: true,
    autoHooksPattern: /\.hook(?:\.ts|\.js|\.cjs|\.mjs)$/i,
    cascadeHooks: true,
    options: { prefix: "/api" },
  });

  // Serve static files
  const uploadDir = path.join(process.cwd(), "../uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  server.register(fastifyStatic, {
    root: uploadDir,
    prefix: "/uploads/",
    setHeaders: (res, _path) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  });

  // Helper to prevent logging massive payloads (e.g., file uploads or huge arrays)
  const getSafeBody = (req: any) => {
    if (!req.body) return undefined;
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) return "[MULTIPART REDACTED]";
    try {
      const stringified = JSON.stringify(req.body);
      return stringified.length > 1000 ? "[BODY TOO LARGE]" : req.body;
    } catch {
      return "[UNSERIALIZABLE BODY]";
    }
  };

  // Set error handler
  server.setErrorHandler((error, request, reply) => {
    // Type guard to check if error has expected properties
    const isErrorWithProps = (
      err: unknown,
    ): err is { statusCode?: number; code?: number; message?: string } =>
      err !== null && typeof err === "object";

    const statusCode = isErrorWithProps(error) ? (error.statusCode ?? error.code ?? 500) : 500;

    // Skip logging 401 Unauthorized and 403 Forbidden errors as they're expected behavior
    if (statusCode !== 401 && statusCode !== 403) {
      const logPayload = {
        err: error,
        userId: (request as any).session?.user?.id,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
          body: getSafeBody(request),
        },
      };

      if (statusCode >= 400 && statusCode < 500) {
        server.log.warn(logPayload, "Client error occurred");
      } else {
        server.log.error(logPayload, "Server error occurred");
      }
    }

    reply.code(statusCode);

    let message = "Internal Server Error";
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
          userId: (request as any).session?.user?.id,
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
            body: getSafeBody(request),
          },
        },
        "Resource not found",
      );

      reply.code(404);

      return { message: "Not Found" };
    },
  );

  // Track slow requests
  server.addHook("onResponse", (request, reply, done) => {
    const responseTime = reply.elapsedTime;
    if (responseTime > (envConfig.log.slowThreshold ?? 500)) {
      server.log.warn(
        {
          responseTime,
          userId: (request as any).session?.user?.id,
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
            body: getSafeBody(request),
          },
        },
        "Slow request detected",
      );
    }
    done();
  });

  return server;
}
