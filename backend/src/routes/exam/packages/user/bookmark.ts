import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { db } from "../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageEventStats,
  examPackageInteractions,
} from "../../../../db/schema/exam/index.ts";
import { and, eq, sql } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const UpdateBookmarkRequest = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  bookmarked: Type.Boolean(),
});

const UpdateBookmarkResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    bookmarked: Type.Boolean(),
    bookmarkCount: Type.Number(),
  }),
});

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/bookmark",
    method: "POST",
    schema: {
      tags: ["Exam Packages"],
      summary: "Update exam package bookmark status",
      description: "Set or unset a bookmark for a specific exam package",
      body: UpdateBookmarkRequest,
      response: {
        200: UpdateBookmarkResponse,
        "4xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
        "5xx": Type.Object({
          success: Type.Boolean({ default: false }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async function handler(
      req: FastifyRequest<{ Body: typeof UpdateBookmarkRequest.static }>,
      reply: FastifyReply,
    ): Promise<typeof UpdateBookmarkResponse.static> {
      const { t } = getTypedI18n(req);
      const userId = (req as any).session.user.id;
      const { packageId, bookmarked } = req.body;

      // Check if package exists
      const pkg = await db.query.examPackages.findFirst({
        where: eq(examPackages.id, packageId),
        columns: { id: true },
      });

      if (!pkg) {
        return reply.notFound(t(($) => $.exam.packages.detail.notFound));
      }

      // Check existing interaction
      const existingInteraction = await db.query.examPackageInteractions.findFirst({
        where: and(
          eq(examPackageInteractions.userId, userId),
          eq(examPackageInteractions.packageId, packageId),
        ),
      });

      const currentlyBookmarked = existingInteraction?.bookmarked ?? false;

      // If status hasn't changed, return current state
      if (currentlyBookmarked === bookmarked) {
        const currentStats = await db.query.examPackageEventStats.findFirst({
          where: eq(examPackageEventStats.packageId, packageId),
          columns: { bookmarkCount: true },
        });

        return reply.status(200).send({
          success: true,
          message: t(($) => $.exam.packages.bookmark.noChange),
          data: {
            bookmarked: currentlyBookmarked,
            bookmarkCount: currentStats?.bookmarkCount ?? 0,
          },
        });
      }

      // Upsert User Interaction
      await db
        .insert(examPackageInteractions)
        .values({
          userId,
          packageId: packageId,
          bookmarked: bookmarked,
        })
        .onConflictDoUpdate({
          target: [examPackageInteractions.userId, examPackageInteractions.packageId],
          set: {
            bookmarked: bookmarked,
            updatedAt: new Date(),
          },
        });

      // Update Global Stats
      const incrementValue = bookmarked ? 1 : -1;

      await db
        .insert(examPackageEventStats)
        .values({
          packageId: packageId,
          bookmarkCount: bookmarked ? 1 : 0,
        })
        .onConflictDoUpdate({
          target: examPackageEventStats.packageId,
          set: {
            bookmarkCount: sql`${examPackageEventStats.bookmarkCount} + ${incrementValue}`,
            updatedAt: new Date(),
          },
        });

      // Fetch final stats
      const finalStats = await db.query.examPackageEventStats.findFirst({
        where: eq(examPackageEventStats.packageId, packageId),
        columns: { bookmarkCount: true },
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.packages.bookmark?.updated || "Bookmark updated"),
        data: {
          bookmarked,
          bookmarkCount: finalStats?.bookmarkCount ?? 0,
        },
      });
    }),
  });
};

export default protectedRoute;
