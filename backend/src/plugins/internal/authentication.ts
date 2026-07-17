import { fromNodeHeaders } from "better-auth/node";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import auth from "../../auth.ts";
import { getUserAvatarUrl } from "../../utils/user/user-utils.ts";
import { db } from "../../db/db-pool.ts";
import { users, usersProfile } from "../../db/schema/user/index.ts";
import { eq } from "drizzle-orm";

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
        if (key.toLowerCase() !== "set-cookie") {
          reply.header(key, value);
        }
      }

      if (typeof response.headers.getSetCookie === "function") {
        for (const cookie of response.headers.getSetCookie()) {
          reply.raw.appendHeader("set-cookie", cookie);
        }
      } else {
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
          reply.raw.appendHeader("set-cookie", setCookie);
        }
      }

      if (response.body) {
        const text = await response.text();
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const data = JSON.parse(text);
            if (data && typeof data === "object") {
              const populateUserExtra = async (userId: string) => {
                const userRecord = await db
                  .select({
                    role: users.role,
                    tierId: usersProfile.tierId,
                  })
                  .from(users)
                  .leftJoin(usersProfile, eq(users.id, usersProfile.id))
                  .where(eq(users.id, userId))
                  .limit(1);

                const record = userRecord.length > 0 ? userRecord[0] : null;
                const role = record?.role || "user";
                const tierId = record?.tierId || "free";
                const showAds = tierId === "free";
                return { role, showAds, tierId };
              };

              const formatUserObject = async (obj: any) => {
                if (obj && typeof obj === "object") {
                  if (obj.user && typeof obj.user === "object" && obj.user.id) {
                    obj.user.image = getUserAvatarUrl(obj.user.id, obj.user.image);
                    const extra = await populateUserExtra(obj.user.id);
                    obj.user.role = obj.user.role || extra.role;
                    obj.user.showAds = extra.showAds;
                    obj.user.tierId = extra.tierId;
                  }
                  if (obj.id && obj.email && "image" in obj) {
                    obj.image = getUserAvatarUrl(obj.id, obj.image);
                    const extra = await populateUserExtra(obj.id);
                    obj.role = obj.role || extra.role;
                    obj.showAds = extra.showAds;
                    obj.tierId = extra.tierId;
                  }
                }
              };

              await formatUserObject(data);
              return reply.send(JSON.stringify(data));
            }
          } catch (_) {
            // Fallback to sending original text
          }
        }
        return reply.send(text);
      }

      return reply.send(null);
    } catch (e: any) {
      console.error("Better Auth Fastify Plugin Error:", e);
      return reply
        .status(500)
        .send({ message: "Internal Server Error", error: e.message, stack: e.stack });
    }
  });
};

export default fp(authentication);
