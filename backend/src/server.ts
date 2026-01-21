import closeWithGrace from 'close-with-grace';

import { ajvFilePlugin } from '@fastify/multipart';
import { buildApp } from './app.ts';
import envConfig from './config/env.config.ts';

async function startServer() {
  const app = await buildApp({
    logger: {
      level: envConfig.log.level,
      redact: ['headers.authorization'],
    },
    ignoreDuplicateSlashes: true,
    ajv: {
      plugins: [ajvFilePlugin as any],
    },
  });

  closeWithGrace(async ({ signal, err }) => {
    if (err) {
      app.log.error({ err }, 'server closing with error');
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
  console.error('Failed to start server:', error);
  process.exit(1);
});
