import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function safeBodyPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('getSafeBody', function (this: any) {
    if (!this.body) return undefined;
    const contentType = this.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) return "[MULTIPART REDACTED]";
    try {
      const stringified = JSON.stringify(this.body);
      return stringified.length > 1000 ? "[BODY TOO LARGE]" : this.body;
    } catch {
      return "[UNSERIALIZABLE BODY]";
    }
  });
}

export default fp(safeBodyPlugin, {
  name: 'request-safe-body',
});
