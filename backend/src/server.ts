import closeWithGrace from "close-with-grace";

import path from "node:path";
import { ajvFilePlugin } from "@fastify/multipart";
import { buildApp } from "./app.ts";
import envConfig from "./config/env.config.ts";

async function startServer() {
  const loggerTargets: any[] = [
    {
      target: "pino/file",
      options: { destination: 1 },
      level: envConfig.log.level,
    },
  ];

  if (envConfig.log.saveToFile) {
    loggerTargets.push({
      target: "pino-roll",
      options: {
        file: path.join(
          process.cwd(),
          envConfig.log.relativePath ?? "..",
          envConfig.log.dir ?? "logs",
          "api-issues",
        ),
        frequency: "daily",
        extension: ".log",
        mkdir: true,
        limit: { count: envConfig.log.retentionDays ?? 14 },
      },
      level: "warn",
    });
  }

  const app = await buildApp({
    logger: {
      level: envConfig.log.level,
      redact: {
        paths: [
          "headers.authorization",
          "req.headers.authorization",
          "request.headers.authorization",
          "body.password",
          "request.body.password",
          "request.body.newPassword",
          "request.body.confirmPassword",
          "request.body.token",
          "request.body.refreshToken",
          "request.body.secret",
        ],
        censor: "[REDACTED]",
      },
      transport: {
        targets: loggerTargets,
      },
    },
    routerOptions: {
      ignoreDuplicateSlashes: true,
    },
    ajv: {
      plugins: [ajvFilePlugin as any],
    },
  });

  closeWithGrace(async ({ signal, err }) => {
    if (err) {
      app.log.error({ err }, "server closing with error");
    } else {
      app.log.info(`${signal} received, server closing`);
    }
    await app.close();
  });

  // Start server
  try {
    await app.listen({ host: envConfig.server.host, port: envConfig.server.port });
  } catch (error: unknown) {
    app.log.error(error);
    process.exit(1);
  }
}

startServer().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
