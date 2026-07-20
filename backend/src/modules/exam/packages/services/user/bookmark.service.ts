import { db } from "../../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageInteractions,
  examPackageEventStats,
} from "../../../../../db/schema/exam/index.ts";
import { and, eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { UpdateBookmarkParams, BookmarkResponseDataT } from "../../packages.schema.ts";

export interface BookmarkResult extends ServiceResponse {
  data?: BookmarkResponseDataT;
}

export async function bookmarkService(
  params: UpdateBookmarkParams,
  userId: string,
): Promise<BookmarkResult> {
  const { packageId, bookmarked } = params;

  // Check if package exists
  const pkg = await db.query.examPackages.findFirst({
    where: eq(examPackages.id, packageId),
    columns: { id: true },
  });

  if (!pkg) {
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

  const currentlyBookmarked = existingInteraction?.bookmarked ?? false;

  // If status hasn't changed, return current state
  if (currentlyBookmarked === bookmarked) {
    const currentStats = await db.query.examPackageEventStats.findFirst({
      where: eq(examPackageEventStats.packageId, packageId),
      columns: { bookmarkCount: true },
    });

    return {
      success: true,
      data: {
        bookmarked: currentlyBookmarked,
        bookmarkCount: currentStats?.bookmarkCount ?? 0,
      },
    };
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

  return {
    success: true,
    data: {
      bookmarked,
      bookmarkCount: finalStats?.bookmarkCount ?? 0,
    },
  };
}
