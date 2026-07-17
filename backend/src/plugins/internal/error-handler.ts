import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { getSafeBody } from '../../utils/request-utils.ts';

async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, request, reply) => {
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
        fastify.log.warn(logPayload, "Client error occurred");
      } else {
        fastify.log.error(logPayload, "Server error occurred");
      }
    }

    reply.code(statusCode);

    let message = "Internal Server Error";
    if (isErrorWithProps(error) && error.statusCode && error.statusCode < 500) {
      message = error.message ?? message;
    } else if (isErrorWithProps(error) && error.message && statusCode < 500) {
      // Catch validation or bad request errors that don't have standard statusCode but have code < 500
      message = error.message;
    }

    return {
      success: false,
      message,
    };
  });
}

export default fp(errorHandlerPlugin, {
  name: 'global-error-handler',
});
