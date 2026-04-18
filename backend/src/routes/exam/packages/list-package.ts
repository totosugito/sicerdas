import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/db-pool.ts";
import {
  examPackages,
  examPackageEventStats,
  examPackageInteractions,
} from "../../../db/schema/exam/index.ts";
import { educationCategories, educationGrades } from "../../../db/schema/education/index.ts";
import { and, eq, sql, ilike, desc, asc } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { EnumContentType } from "../../../db/schema/enum/enum-app.ts";
import { getPackageThumbnailUrl } from "../../../utils/exam-utils.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthInstance } from "../../../decorators/auth.decorator.ts";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const PackageListQuery = Type.Object({
  categoryId: Type.Optional(Type.String({ format: "uuid" })),
  categoryKey: Type.Optional(Type.String({ description: "Search by category human-readable key" })),
  educationGradeId: Type.Optional(Type.Number()),
  search: Type.Optional(Type.String({ description: "Search term for package title" })),
  sortBy: Type.Optional(
    Type.String({
      description: "Sort field: createdAt, title, rating, viewCount",
      default: "createdAt",
    }),
  ),
  sortOrder: Type.Optional(
    Type.String({ description: "Sort order: asc or desc", default: "desc" }),
  ),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 50 })),
});

const PackageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  examType: Type.String(),
  durationMinutes: Type.Number(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  requiredTier: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
  stats: Type.Object({
    totalSections: Type.Number(),
    activeSections: Type.Number(),
    totalQuestions: Type.Number(),
    activeQuestions: Type.Number(),
    rating: Type.Number(),
    viewCount: Type.Number(),
    likeCount: Type.Number(),
    bookmarkCount: Type.Number(),
  }),
  category: Type.Object({
    id: Type.String({ format: "uuid" }),
    name: Type.String(),
    key: Type.String(),
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
    }),
  ),
  isNew: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

const PackageListResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String({ default: "Success" }),
  data: Type.Object({
    items: Type.Array(PackageResponseItem),
    meta: Type.Object({
      total: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      totalPages: Type.Number(),
    }),
  }),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list",
    method: "POST",
    schema: {
      tags: ["Exam Packages"],
      summary: "List exam packages",
      description: "Get a paginated list of exam packages with filtering and sorting options",
      body: PackageListQuery,
      response: {
        200: PackageListResponse,
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
      req: FastifyRequest<{ Body: typeof PackageListQuery.static }>,
      reply: FastifyReply,
    ): Promise<typeof PackageListResponse.static> {
      const { t } = getTypedI18n(req);
      const {
        categoryId,
        categoryKey,
        educationGradeId,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 10,
      } = req.body;
      const offset = (page - 1) * limit;

      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      // Check if user is logged in
      const isLoggedIn = !!session?.user;
      const userId = isLoggedIn ? session?.user?.id : null;

      const conditions = [];
      conditions.push(eq(examPackages.isActive, true));

      if (search && search.trim() !== "") {
        const searchTerm: string = `%${search.trim().toLowerCase()}%`;
        conditions.push(ilike(examPackages.title, searchTerm));
      }

      if (categoryId) {
        conditions.push(eq(examPackages.categoryId, categoryId));
      }

      if (categoryKey) {
        conditions.push(eq(educationCategories.key, categoryKey));
      }

      if (educationGradeId) {
        conditions.push(eq(examPackages.educationGradeId, educationGradeId));
      }

      const latestVersionId = app.versionCache.get(EnumContentType.EXAM);

      // Build base query
      let baseQuery = db
        .select({
          id: examPackages.id,
          title: examPackages.title,
          description: examPackages.description,
          examType: examPackages.examType,
          durationMinutes: examPackages.durationMinutes,
          thumbnail: examPackages.thumbnail,
          requiredTier: examPackages.requiredTier,
          isActive: examPackages.isActive,
          totalSections: examPackages.totalSections,
          activeSections: examPackages.activeSections,
          totalQuestions: examPackages.totalQuestions,
          activeQuestions: examPackages.activeQuestions,
          createdAt: examPackages.createdAt,
          updatedAt: examPackages.updatedAt,
          category: {
            id: educationCategories.id,
            name: educationCategories.name,
            key: educationCategories.key,
          },
          grade: {
            id: educationGrades.id,
            name: educationGrades.name,
          },
          rating: examPackageEventStats.rating,
          viewCount: examPackageEventStats.viewCount,
          likeCount: examPackageEventStats.likeCount,
          bookmarkCount: examPackageEventStats.bookmarkCount,
          isNew: latestVersionId
            ? sql<boolean>`${examPackages.versionId} = ${latestVersionId}`.as("isNew")
            : sql<boolean>`false`.as("isNew"),
          liked: isLoggedIn ? examPackageInteractions.liked : sql<boolean | null>`NULL`.as("liked"),
          disliked: isLoggedIn
            ? examPackageInteractions.disliked
            : sql<boolean | null>`NULL`.as("disliked"),
          userRating: isLoggedIn
            ? examPackageInteractions.rating
            : sql<string | null>`NULL`.as("userRating"),
          bookmarked: isLoggedIn
            ? examPackageInteractions.bookmarked
            : sql<boolean | null>`NULL`.as("bookmarked"),
        })
        .from(examPackages)
        .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
        .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
        .leftJoin(examPackageEventStats, eq(examPackages.id, examPackageEventStats.packageId));

      if (isLoggedIn && userId) {
        baseQuery = baseQuery.leftJoin(
          examPackageInteractions,
          and(
            eq(examPackages.id, examPackageInteractions.packageId),
            eq(examPackageInteractions.userId, userId),
          ),
        );
      }

      const queryWithWhere = baseQuery.where(and(...conditions));

      // Sorting
      const order = sortOrder === "asc" ? "asc" : "desc";
      let query;

      switch (sortBy) {
        case "title":
          query =
            order === "asc"
              ? queryWithWhere.orderBy(asc(examPackages.title))
              : queryWithWhere.orderBy(desc(examPackages.title));
          break;
        case "rating":
          query =
            order === "asc"
              ? queryWithWhere.orderBy(asc(examPackageEventStats.rating))
              : queryWithWhere.orderBy(desc(examPackageEventStats.rating));
          break;
        case "viewCount":
          query =
            order === "asc"
              ? queryWithWhere.orderBy(asc(examPackageEventStats.viewCount))
              : queryWithWhere.orderBy(desc(examPackageEventStats.viewCount));
          break;
        case "createdAt":
        default:
          query =
            order === "asc"
              ? queryWithWhere.orderBy(asc(examPackages.createdAt))
              : queryWithWhere.orderBy(desc(examPackages.createdAt));
          break;
      }

      // Count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(query.as("subquery"));

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // Fetch
      const items = await query.limit(limit).offset(offset);

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.packages.list.success),
        data: {
          items: items.map((item: any) => {
            const processedItem = {
              id: item.id,
              title: item.title,
              description: item.description,
              examType: item.examType,
              durationMinutes: item.durationMinutes,
              thumbnail: getPackageThumbnailUrl(item.thumbnail),
              requiredTier: item.requiredTier,
              isActive: item.isActive,
              stats: {
                totalSections: item.totalSections,
                activeSections: item.activeSections,
                totalQuestions: item.totalQuestions,
                activeQuestions: item.activeQuestions,
                rating: item.rating !== null ? parseFloat(item.rating.toString()) : 0,
                viewCount: item.viewCount !== null ? item.viewCount : 0,
                likeCount: item.likeCount !== null ? item.likeCount : 0,
                bookmarkCount: item.bookmarkCount !== null ? item.bookmarkCount : 0,
              },
              category: item.category
                ? { id: item.category.id, name: item.category.name, key: item.category.key }
                : { id: "", name: "", key: "" },
              grade: item.grade
                ? { id: item.grade.id, name: item.grade.name }
                : { id: 0, name: "" },
              isNew: !!item.isNew,
              createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
              updatedAt: item.updatedAt ? item.updatedAt.toISOString() : new Date().toISOString(),
            };

            if (isLoggedIn) {
              return {
                ...processedItem,
                userInteraction: {
                  liked: item.liked !== undefined && item.liked !== null ? item.liked : false,
                  disliked:
                    item.disliked !== undefined && item.disliked !== null ? item.disliked : false,
                  rating:
                    item.userRating !== undefined && item.userRating !== null
                      ? parseFloat(item.userRating.toString())
                      : 0,
                  bookmarked:
                    item.bookmarked !== undefined && item.bookmarked !== null
                      ? item.bookmarked
                      : false,
                },
              };
            }

            return processedItem;
          }),
          meta: {
            total,
            page,
            limit,
            totalPages,
          },
        },
      });
    }),
  });
};

export default publicRoute;
