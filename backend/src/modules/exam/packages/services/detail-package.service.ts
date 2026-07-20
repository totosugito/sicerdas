import { db } from "../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageEventStats,
  examPackageInteractions,
} from "../../../../db/schema/exam/index.ts";
import { appEventHistory } from "../../../../db/schema/app/app-event-history.ts";
import { educationCategories, educationGrades } from "../../../../db/schema/education/index.ts";
import { and, eq, sql, desc, or } from "drizzle-orm";
import { EnumExamType, EnumExamPackageUserStatus } from "../../../../db/schema/exam/enums.ts";
import { EnumContentType, EnumEventStatus } from "../../../../db/schema/enum/enum-app.ts";
import { getPackageThumbnailUrl } from "../../../../utils/exam/exam-utils.ts";
import config from "../../../../config/env.config.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PublicPackageDetailData } from "../packages.schema.ts";

export interface PublicDetailPackageResult extends ServiceResponse {
  data?: PublicPackageDetailData;
}

export async function publicDetailPackageService(
  id: string,
  userId: string | null,
  latestVersionId: number | null,
  clientIp: string | undefined,
  sessionId: string | null,
  userAgent: string | undefined,
): Promise<PublicDetailPackageResult> {
  const isLoggedIn = !!userId;

  // Build the base query
  const baseQuery = db
    .select({
      // Package fields
      id: examPackages.id,
      title: examPackages.title,
      description: examPackages.description,
      examType: examPackages.examType,
      durationMinutes: examPackages.durationMinutes,
      thumbnail: examPackages.thumbnail,
      requiredTier: examPackages.requiredTier,
      isActive: examPackages.isActive,
      activeSections: examPackages.activeSections,
      activeQuestions: examPackages.activeQuestions,
      createdAt: examPackages.createdAt,
      updatedAt: examPackages.updatedAt,
      versionId: examPackages.versionId,
      category: {
        id: educationCategories.id,
        name: educationCategories.name,
        key: educationCategories.key,
      },
      grade: {
        id: educationGrades.id,
        name: educationGrades.name,
      },
      // Global Stats
      rating: examPackageEventStats.rating,
      viewCount: examPackageEventStats.viewCount,
      likeCount: examPackageEventStats.likeCount,
      bookmarkCount: examPackageEventStats.bookmarkCount,
      ratingCount: examPackageEventStats.ratingCount,
      // User interaction data
      liked: examPackageInteractions.liked,
      disliked: examPackageInteractions.disliked,
      userRating: examPackageInteractions.rating,
      bookmarked: examPackageInteractions.bookmarked,
      interactionStatus: examPackageInteractions.status,
      completedSectionsCount: examPackageInteractions.completedSectionsCount,
      userViewCount: examPackageInteractions.viewCount,
      isNew: latestVersionId
        ? sql<boolean>`${examPackages.versionId} = ${latestVersionId}`.as("isNew")
        : sql<boolean>`false`.as("isNew"),
    })
    .from(examPackages)
    .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
    .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
    .leftJoin(examPackageEventStats, eq(examPackages.id, examPackageEventStats.packageId))
    .leftJoin(
      examPackageInteractions,
      userId
        ? and(
            eq(examPackages.id, examPackageInteractions.packageId),
            eq(examPackageInteractions.userId, userId),
          )
        : sql`FALSE`,
    )
    .where(
      and(
        eq(examPackages.id, id),
        eq(examPackages.isActive, true),
        or(
          eq(examPackages.examType, EnumExamType.OFFICIAL),
          userId ? eq(examPackages.createdByUserId, userId) : sql`FALSE`,
        ),
      ),
    );

  const result = await baseQuery;

  if (!result || result.length === 0) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.detail.notFound,
    };
  }

  const pkg = result[0];

  const processedPackage: PublicPackageDetailData = {
    id: pkg.id,
    title: pkg.title,
    description: pkg.description,
    examType: pkg.examType,
    durationMinutes: pkg.durationMinutes,
    thumbnail: getPackageThumbnailUrl(pkg.thumbnail),
    requiredTier: pkg.requiredTier,
    isActive: pkg.isActive,
    stats: {
      activeSections: pkg.activeSections,
      activeQuestions: pkg.activeQuestions,
      rating:
        pkg.ratingCount && pkg.ratingCount > 0
          ? pkg.rating !== null
            ? parseFloat(pkg.rating.toString())
            : 0
          : 5.0,
      viewCount: pkg.viewCount !== null ? pkg.viewCount : 0,
      likeCount: pkg.likeCount !== null ? pkg.likeCount : 0,
      bookmarkCount: pkg.bookmarkCount !== null ? pkg.bookmarkCount : 0,
      ratingCount: pkg.ratingCount !== null ? pkg.ratingCount : 0,
    },
    category: pkg.category
      ? { id: pkg.category.id, name: pkg.category.name, key: pkg.category.key }
      : { id: "", name: "", key: "" },
    grade: pkg.grade ? { id: pkg.grade.id, name: pkg.grade.name } : { id: 0, name: "" },
    isNew: !!pkg.isNew,
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
  };

  // Tracking Logic
  const shouldTrack = async (targetUserId: string | null, targetSessionId: string | null) => {
    const lastEvent = await db.query.userEventHistory.findFirst({
      where: and(
        eq(appEventHistory.referenceId, pkg.id),
        eq(appEventHistory.action, EnumEventStatus.VIEW),
        targetUserId
          ? eq(appEventHistory.userId, targetUserId)
          : targetSessionId
            ? eq(appEventHistory.sessionId, targetSessionId)
            : eq(appEventHistory.ipAddress, clientIp ?? null as any),
      ),
      orderBy: desc(appEventHistory.createdAt),
    });

    const now = new Date();
    if (
      !lastEvent ||
      now.getTime() - lastEvent.createdAt.getTime() > config.limits.contentCounterWindowMs
    ) {
      // Log history
      await db.insert(appEventHistory).values({
        userId: targetUserId,
        referenceId: pkg.id,
        contentType: EnumContentType.EXAM,
        action: EnumEventStatus.VIEW,
        sessionId: targetSessionId,
        ipAddress: clientIp,
        userAgent: userAgent,
      });

      // Update Global Stats
      await db
        .insert(examPackageEventStats)
        .values({
          packageId: pkg.id,
          viewCount: 1,
        })
        .onConflictDoUpdate({
          target: examPackageEventStats.packageId,
          set: {
            viewCount: sql`${examPackageEventStats.viewCount} + 1`,
            updatedAt: new Date(),
          },
        });

      return true; // Indicates new view monitored
    }
    return false;
  };

  if (isLoggedIn && userId) {
    const isNewView = await shouldTrack(userId, null);
    if (isNewView) {
      // Update User Personal Stats
      await db
        .insert(examPackageInteractions)
        .values({
          userId,
          packageId: pkg.id,
          viewCount: 1,
        })
        .onConflictDoUpdate({
          target: [examPackageInteractions.userId, examPackageInteractions.packageId],
          set: {
            viewCount: sql`${examPackageInteractions.viewCount} + 1`,
            updatedAt: new Date(),
          },
        });
    }
  } else {
    await shouldTrack(null, sessionId);
  }

  // Add user interaction data if user is logged in
  if (isLoggedIn && pkg.liked !== undefined) {
    return {
      success: true,
      data: {
        ...processedPackage,
        userInteraction: {
          liked: pkg.liked !== undefined && pkg.liked !== null ? pkg.liked : false,
          disliked: pkg.disliked !== undefined && pkg.disliked !== null ? pkg.disliked : false,
          rating:
            pkg.userRating !== undefined && pkg.userRating !== null
              ? parseFloat(pkg.userRating.toString())
              : 0,
          bookmarked:
            pkg.bookmarked !== undefined && pkg.bookmarked !== null ? pkg.bookmarked : false,
          status:
            pkg.interactionStatus !== undefined && pkg.interactionStatus !== null
              ? (pkg.interactionStatus as "not_started" | "in_progress" | "completed")
              : EnumExamPackageUserStatus.NOT_STARTED,
          completedSectionsCount:
            pkg.completedSectionsCount !== undefined && pkg.completedSectionsCount !== null
              ? pkg.completedSectionsCount
              : 0,
          viewCount:
            pkg.userViewCount !== undefined && pkg.userViewCount !== null
              ? pkg.userViewCount
              : 0,
        },
      },
    };
  }

  return {
    success: true,
    data: processedPackage,
  };
}
