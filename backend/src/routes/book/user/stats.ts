import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../../db/db-pool.ts";
import { bookInteractions } from "../../../db/schema/book/index.ts";
import { eq, sql } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const BookStatsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    totalFavorites: Type.Number(),
    totalMaterialsRead: Type.Number(),
    totalDownloads: Type.Number(),
  }),
});

const getBookStatsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/stats",
    method: "GET",
    schema: {
      tags: ["V1/Book/User"],
      summary: "Get user's book interaction statistics",
      response: {
        200: BookStatsResponse,
      },
    },
    handler: async function handler(
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof BookStatsResponse.static> {
      const { t } = getTypedI18n(req);
      const userId = (req as any).session.user.id;

      const [stats] = await db
        .select({
          totalFavorites: sql<number>`count(*) filter (where ${bookInteractions.bookmarked} = true)::int`,
          totalMaterialsRead: sql<number>`count(*) filter (where ${bookInteractions.viewCount} > 0)::int`,
          totalDownloads: sql<number>`coalesce(sum(${bookInteractions.downloadCount}), 0)::int`,
        })
        .from(bookInteractions)
        .where(eq(bookInteractions.userId, userId));

      return reply.status(200).send({
        success: true,
        message: t(($) => $.book.list.success),
        data: {
          totalFavorites: stats?.totalFavorites ?? 0,
          totalMaterialsRead: stats?.totalMaterialsRead ?? 0,
          totalDownloads: stats?.totalDownloads ?? 0,
        },
      });
    },
  });
};

export default getBookStatsRoute;
