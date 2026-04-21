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

const UpdateRatingRequest = Type.Object({
  packageId: Type.String({ format: "uuid" }),
  rating: Type.Number({ minimum: 1, maximum: 5 }),
});

const UpdateRatingResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    rating: Type.Number(),
    ratingCount: Type.Number(),
    userInteraction: Type.Object({
      rating: Type.Number(),
    }),
  }),
});

const ratingRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/rating",
    method: "POST",
    schema: {
      tags: ["Exam Packages User"],
      summary: "Update exam package rating",
      description: "Set a rating for a specific exam package",
      body: UpdateRatingRequest,
      response: {
        200: UpdateRatingResponse,
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
      req: FastifyRequest<{ Body: typeof UpdateRatingRequest.static }>,
      reply: FastifyReply,
    ): Promise<typeof UpdateRatingResponse.static> {
      const { t } = getTypedI18n(req);
      const session = (req as any).session;
      const user = session?.user;

      if (!user) {
        return reply.unauthorized(t(($) => $.auth.unauthorized));
      }

      const userId = user.id;
      const { packageId, rating } = req.body;

      // Verify package existence
      const pkgList = await db
        .select({ id: examPackages.id })
        .from(examPackages)
        .where(and(eq(examPackages.id, packageId), eq(examPackages.isActive, true)))
        .limit(1);

      if (pkgList.length === 0) {
        return reply.notFound(t(($) => $.exam.packages.detail.notFound));
      }

      // Check existing interaction
      const existingInteraction = await db.query.examPackageInteractions.findFirst({
        where: and(
          eq(examPackageInteractions.userId, userId),
          eq(examPackageInteractions.packageId, packageId),
        ),
      });

      const oldRating = existingInteraction?.rating
        ? parseFloat(existingInteraction.rating.toString())
        : 0;

      // If rating hasn't changed, return current state
      if (oldRating === rating) {
        const currentStats = await db.query.examPackageEventStats.findFirst({
          where: eq(examPackageEventStats.packageId, packageId),
          columns: { rating: true, ratingCount: true },
        });

        return reply.status(200).send({
          success: true,
          message: t(($) => $.exam.packages.detail.success),
          data: {
            rating: currentStats?.rating ? parseFloat(currentStats.rating.toString()) : 0,
            ratingCount: currentStats?.ratingCount ?? 0,
            userInteraction: {
              rating: oldRating,
            },
          },
        });
      }

      // Upsert User Interaction
      await db
        .insert(examPackageInteractions)
        .values({
          userId,
          packageId: packageId,
          rating: rating.toFixed(2),
        })
        .onConflictDoUpdate({
          target: [examPackageInteractions.userId, examPackageInteractions.packageId],
          set: {
            rating: rating.toFixed(2),
            updatedAt: new Date(),
          },
        });

      // Update Global Stats
      const isFirstTime = oldRating === 0;
      const ratingDiff = rating - oldRating;

      await db
        .insert(examPackageEventStats)
        .values({
          packageId: packageId,
          ratingSum: rating.toFixed(2),
          ratingCount: 1,
          rating: rating.toFixed(2),
        })
        .onConflictDoUpdate({
          target: examPackageEventStats.packageId,
          set: {
            ratingSum: sql`${examPackageEventStats.ratingSum} + ${ratingDiff}`,
            ratingCount: isFirstTime
              ? sql`${examPackageEventStats.ratingCount} + 1`
              : sql`${examPackageEventStats.ratingCount}`,
            updatedAt: new Date(),
          },
        });

      // Recalculate average rating
      await db
        .update(examPackageEventStats)
        .set({
          rating: sql`CASE WHEN ${examPackageEventStats.ratingCount} > 0 THEN ${examPackageEventStats.ratingSum} / ${examPackageEventStats.ratingCount} ELSE 0 END`,
        })
        .where(eq(examPackageEventStats.packageId, packageId));

      // Fetch final stats
      const finalStats = await db.query.examPackageEventStats.findFirst({
        where: eq(examPackageEventStats.packageId, packageId),
        columns: { rating: true, ratingCount: true },
      });

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.packages.detail.success),
        data: {
          rating: finalStats?.rating ? parseFloat(finalStats.rating.toString()) : 0,
          ratingCount: finalStats?.ratingCount ?? 0,
          userInteraction: {
            rating,
          },
        },
      });
    }),
  });
};

export default ratingRoute;
