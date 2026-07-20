import { db } from "../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageInteractions,
  examPackageEventStats,
} from "../../../../db/schema/exam/index.ts";
import { and, eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { UpdateRatingParams, RatingResponseDataT } from "../packages.schema.ts";

export interface RatingResult extends ServiceResponse {
  data?: RatingResponseDataT;
}

export async function ratingService(
  params: UpdateRatingParams,
  userId: string,
): Promise<RatingResult> {
  const { packageId, rating } = params;

  // Verify package existence
  const pkgList = await db
    .select({ id: examPackages.id })
    .from(examPackages)
    .where(and(eq(examPackages.id, packageId), eq(examPackages.isActive, true)))
    .limit(1);

  if (pkgList.length === 0) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.detail.notFound,
    };
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

    return {
      success: true,
      data: {
        rating: currentStats?.rating ? parseFloat(currentStats.rating.toString()) : 0,
        ratingCount: currentStats?.ratingCount ?? 0,
        userInteraction: {
          rating: oldRating,
        },
      },
    };
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

  const isFirstTime = oldRating === 0;
  const ratingDiff = rating - oldRating;

  // Update Global Stats
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

  return {
    success: true,
    data: {
      rating: finalStats?.rating ? parseFloat(finalStats.rating.toString()) : 0,
      ratingCount: finalStats?.ratingCount ?? 0,
      userInteraction: {
        rating,
      },
    },
  };
}
