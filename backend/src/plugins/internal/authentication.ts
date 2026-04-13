import { fromNodeHeaders } from "better-auth/node";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import auth from "../../auth.ts";

const authentication: FastifyPluginAsync = async (fastify) => {
  fastify.all("/api/auth/*", async (request, reply) => {
    try {
      const url = new URL(request.url, `${request.protocol}://${request.headers.host}`);
      const headers = fromNodeHeaders(request.headers);

      const requestOptions: RequestInit = {
        method: request.method,
        headers,
      };

      if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
        requestOptions.body =
          typeof request.body === "string" ? request.body : JSON.stringify(request.body);
      }

      const req = new Request(url.toString(), requestOptions);

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
    } catch (e: any) {
      console.error("Better Auth Fastify Plugin Error:", e);
      return reply
        .status(500)
        .send({ message: "Internal Server Error", error: e.message, stack: e.stack });
    }
  });
};

export default fp(authentication);
