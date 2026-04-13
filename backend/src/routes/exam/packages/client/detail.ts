import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../../../utils/withErrorHandler.ts";
import { db } from "../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageEventStats,
  examPackageInteractions,
} from "../../../../db/schema/exam/index.ts";
import { educationCategories, educationGrades } from "../../../../db/schema/education/index.ts";
import { appEventHistory } from "../../../../db/schema/app/app-event-history.ts";
import { and, eq, sql, desc } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getPackageThumbnailUrl } from "../../../../utils/exam-utils.ts";
import { EnumContentType, EnumEventStatus } from "../../../../db/schema/enum/enum-app.ts";
import { CONFIG } from "../../../../config/app-constant.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../../decorators/auth.decorator.ts";
import { getTypedI18n } from "../../../../utils/i18n-typed.ts";

const PackageDetailResponse = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  examType: Type.String(),
  durationMinutes: Type.Number(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  rating: Type.Optional(Type.Number()),
  viewCount: Type.Optional(Type.Number()),
  likeCount: Type.Optional(Type.Number()),
  bookmarkCount: Type.Optional(Type.Number()),
  category: Type.Object({
    id: Type.String({ format: "uuid" }),
    name: Type.String(),
  }),
  grade: Type.Object({
    id: Type.Number(),
    name: Type.String(),
  }),
  // User interaction data (only present when user is logged in)
  userInteraction: Type.Optional(
    Type.Object({
      liked: Type.Boolean(),
      disliked: Type.Boolean(),
      rating: Type.Number(),
      bookmarked: Type.Boolean(),
      viewCount: Type.Number(),
    }),
  ),
  isNew: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const PackageDetailResponseWrapper = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: PackageDetailResponse,
});

const packageDetailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/detail/:id",
    method: "GET",
    schema: {
      tags: ["Exam Packages"],
      summary: "Get exam package detail",
      description: "Get detailed information about a specific exam package by its ID",
      params: Type.Object({
        id: Type.String({ format: "uuid" }),
      }),
      response: {
        200: PackageDetailResponseWrapper,
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
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ): Promise<typeof PackageDetailResponseWrapper.static> {
      const { t } = getTypedI18n(req);
      const { id } = req.params;
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      // Check if user is logged in
      const isLoggedIn = !!session?.user;
      const userId = isLoggedIn ? session?.user?.id : null;

      // Build the base query
      const baseQuery = db
        .select({
          id: examPackages.id,
          title: examPackages.title,
          description: examPackages.description,
          examType: examPackages.examType,
          durationMinutes: examPackages.durationMinutes,
          thumbnail: examPackages.thumbnail,
          requiredTier: examPackages.requiredTier,
          isActive: examPackages.isActive,
          versionId: examPackages.versionId,
          createdAt: examPackages.createdAt,
          updatedAt: examPackages.updatedAt,
          category: {
            id: educationCategories.id,
            name: educationCategories.name,
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
          // User interaction data
          liked: examPackageInteractions.liked,
          disliked: examPackageInteractions.disliked,
          userRating: examPackageInteractions.rating,
          bookmarked: examPackageInteractions.bookmarked,
          userViewCount: examPackageInteractions.viewCount,
          isNew: app.versionCache.get(EnumContentType.EXAM)
            ? sql<boolean>`${examPackages.versionId} = ${app.versionCache.get(EnumContentType.EXAM)}`.as(
                "isNew",
              )
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
        .where(and(eq(examPackages.id, id), eq(examPackages.isActive, true)));

      const result = await baseQuery;

      if (!result || result.length === 0) {
        return reply.notFound(t(($) => $.exam.packages.detail.notFound));
      }

      const pkg = result[0];

      const processedPackage = {
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        examType: pkg.examType,
        durationMinutes: pkg.durationMinutes,
        thumbnail: getPackageThumbnailUrl(pkg.thumbnail),
        requiredTier: pkg.requiredTier,
        isActive: pkg.isActive,
        rating: pkg.rating !== null ? parseFloat(pkg.rating.toString()) : undefined,
        viewCount: pkg.viewCount !== null ? pkg.viewCount : undefined,
        likeCount: pkg.likeCount !== null ? pkg.likeCount : undefined,
        bookmarkCount: pkg.bookmarkCount !== null ? pkg.bookmarkCount : undefined,
        category: pkg.category
          ? { id: pkg.category.id, name: pkg.category.name }
          : { id: "", name: "" },
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
                : eq(appEventHistory.ipAddress, req.ip),
          ),
          orderBy: desc(appEventHistory.createdAt),
        });

        const now = new Date();
        if (
          !lastEvent ||
          now.getTime() - lastEvent.createdAt.getTime() > CONFIG.CONTENT_COUNTER_WINDOW_MS
        ) {
          // Log history
          await db.insert(appEventHistory).values({
            userId: targetUserId,
            referenceId: pkg.id,
            contentType: EnumContentType.EXAM,
            action: EnumEventStatus.VIEW,
            sessionId: targetSessionId,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
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
        const sessionId = req.cookies?.sessionId || null;
        await shouldTrack(null, sessionId);
      }

      // Add user interaction data if user is logged in
      if (isLoggedIn && pkg.liked !== undefined) {
        return reply.status(200).send({
          success: true,
          message: t(($) => $.exam.packages.detail.success),
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
              viewCount:
                pkg.userViewCount !== undefined && pkg.userViewCount !== null
                  ? pkg.userViewCount
                  : 0,
            },
          },
        });
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.packages.detail.success),
        data: processedPackage,
      });
    }),
  });
};

export default packageDetailRoute;
