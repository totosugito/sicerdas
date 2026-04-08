import { fromNodeHeaders } from "better-auth/node";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import auth from "../../auth.ts";

const authentication: FastifyPluginAsync = async (fastify) => {
  fastify.all("/api/auth/*", async (request, reply) => {
    const url = new URL(request.url, `${request.protocol}://${request.headers.host}`);
    const headers = fromNodeHeaders(request.headers);

    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });

    const response = await auth.handler(req);

    reply.status(response.status);

    // Properly forward headers, especially multiple Set-Cookie headers
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === "set-cookie") {
        reply.raw.appendHeader(key, value);
      } else {
        reply.header(key, value);
      }
    }

    return reply.send(response.body ? await response.text() : null);
  });
};

export default fp(authentication);
