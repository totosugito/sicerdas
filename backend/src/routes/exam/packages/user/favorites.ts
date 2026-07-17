import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageEventStats,
  examPackageInteractions,
} from "../../../../db/schema/exam/index.ts";
import { educationCategories } from "../../../../db/schema/education/index.ts";

import { and, eq, desc, sql } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getPackageThumbnailUrl } from "../../../../utils/exam/exam-utils.ts";

const FavoritePackageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  category: Type.Object({
    name: Type.String(),
  }),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  stats: Type.Object({
    rating: Type.Number(),
    activeQuestions: Type.Number(),
    activeSections: Type.Number(),
  }),
  userInteraction: Type.Object({
    status: Type.Union([
      Type.Literal("not_started"),
      Type.Literal("in_progress"),
      Type.Literal("completed"),
    ]),
    completedSectionsCount: Type.Number(),
  }),
  bookmarkedAt: Type.String({ format: "date-time" }),
});

const FavoritePackagesResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(FavoritePackageResponseItem),
  pagination: Type.Object({
    total: Type.Number(),
    page: Type.Number(),
    pageSize: Type.Number(),
    totalPages: Type.Number(),
  }),
});

const listFavoritesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/favorites",
    method: "GET",
    schema: {
      tags: ["Exam Packages"],
      summary: "List user's bookmarked exam packages",
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        pageSize: Type.Optional(Type.Number({ minimum: 1, maximum: 20, default: 5 })),
      }),
      response: {
        200: FavoritePackagesResponse,
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
    handler: async function handler(
      req: FastifyRequest<{
        Querystring: { page: number; pageSize: number };
      }>,
      reply: FastifyReply,
    ): Promise<typeof FavoritePackagesResponse.static> {
            const userId = (req as any).session.user.id;
      const { page, pageSize } = req.query;
      const offset = (page - 1) * pageSize;

      const whereClause = and(
        eq(examPackageInteractions.userId, userId),
        eq(examPackageInteractions.bookmarked, true),
        eq(examPackages.isActive, true),
      );

      // 1. Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(examPackageInteractions)
        .innerJoin(examPackages, eq(examPackageInteractions.packageId, examPackages.id))
        .where(whereClause);

      const total = Number(countResult?.count || 0);

      // 2. Get paginated data
      const favorites = await db
        .select({
          id: examPackages.id,
          title: examPackages.title,
          thumbnail: examPackages.thumbnail,
          activeQuestions: examPackages.activeQuestions,
          activeSections: examPackages.activeSections,
          categoryName: educationCategories.name,
          rating: examPackageEventStats.rating,
          status: examPackageInteractions.status,
          completedSectionsCount: examPackageInteractions.completedSectionsCount,
          bookmarkedAt: examPackageInteractions.updatedAt,
        })
        .from(examPackageInteractions)
        .innerJoin(examPackages, eq(examPackageInteractions.packageId, examPackages.id))
        .innerJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
        .leftJoin(examPackageEventStats, eq(examPackages.id, examPackageEventStats.packageId))
        .where(whereClause)
        .orderBy(desc(examPackageInteractions.updatedAt))
        .limit(pageSize)
        .offset(offset);

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.list.success),
        data: favorites.map((item) => ({
          id: item.id,
          title: item.title,
          category: {
            name: item.categoryName,
          },
          thumbnail: getPackageThumbnailUrl(item.thumbnail),
          stats: {
            rating: item.rating !== null ? parseFloat(item.rating.toString()) : 0,
            activeQuestions: item.activeQuestions,
            activeSections: item.activeSections,
          },
          userInteraction: {
            status: item.status,
            completedSectionsCount: item.completedSectionsCount,
          },
          bookmarkedAt: item.bookmarkedAt.toISOString(),
        })),
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    },
  });
};

export default listFavoritesRoute;
