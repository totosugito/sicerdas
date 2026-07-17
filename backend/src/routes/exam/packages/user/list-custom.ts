import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "../../../../db/db-pool.ts";
import {
  examPackages,
  examPackageInteractions,
} from "../../../../db/schema/exam/index.ts";
import { educationCategories, educationGrades } from "../../../../db/schema/education/index.ts";
import { and, eq, desc, sql } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getPackageThumbnailUrl } from "../../../../utils/exam-utils.ts";
import { EnumExamPackageUserStatus, EnumExamType } from "../../../../db/schema/exam/enums.ts";

const CustomPackageResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  thumbnail: Type.Union([Type.String(), Type.Null()]),
  durationMinutes: Type.Number(),
  stats: Type.Object({
    activeQuestions: Type.Number(),
    activeSections: Type.Number(),
  }),
  category: Type.Object({
    name: Type.String(),
  }),
  grade: Type.Object({
    name: Type.String(),
  }),
  userInteraction: Type.Object({
    status: Type.Enum(EnumExamPackageUserStatus),
    completedSectionsCount: Type.Number(),
  }),
  createdAt: Type.String({ format: "date-time" }),
});

const CustomPackagesListResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(CustomPackageResponseItem),
  pagination: Type.Object({
    total: Type.Number(),
    page: Type.Number(),
    pageSize: Type.Number(),
    totalPages: Type.Number(),
  }),
});

const listCustomRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/list-custom",
    method: "GET",
    schema: {
      tags: ["Exam Packages"],
      summary: "List user's generated custom practice packages",
      querystring: Type.Object({
        page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
        pageSize: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 10 })),
      }),
      response: {
        200: CustomPackagesListResponse,
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
    ): Promise<typeof CustomPackagesListResponse.static> {
            const userId = (req as any).session.user.id;
      const { page, pageSize } = req.query;
      const offset = (page - 1) * pageSize;

      const whereClause = and(
        eq(examPackages.createdByUserId, userId),
        eq(examPackages.examType, EnumExamType.CUSTOM_PRACTICE),
        eq(examPackages.isActive, true),
      );

      // 1. Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(examPackages)
        .where(whereClause);

      const total = Number(countResult?.count || 0);

      // 2. Get paginated data
      const items = await db
        .select({
          id: examPackages.id,
          title: examPackages.title,
          thumbnail: examPackages.thumbnail,
          durationMinutes: examPackages.durationMinutes,
          activeQuestions: examPackages.activeQuestions,
          activeSections: examPackages.activeSections,
          categoryName: educationCategories.name,
          gradeName: educationGrades.name,
          status: examPackageInteractions.status,
          completedSectionsCount: examPackageInteractions.completedSectionsCount,
          createdAt: examPackages.createdAt,
        })
        .from(examPackages)
        .leftJoin(educationCategories, eq(examPackages.categoryId, educationCategories.id))
        .leftJoin(educationGrades, eq(examPackages.educationGradeId, educationGrades.id))
        .leftJoin(
          examPackageInteractions,
          and(
            eq(examPackages.id, examPackageInteractions.packageId),
            eq(examPackageInteractions.userId, userId),
          ),
        )
        .where(whereClause)
        .orderBy(desc(examPackages.createdAt))
        .limit(pageSize)
        .offset(offset);

      return reply.status(200).send({
        success: true,
        message: req.t(($) => $.exam.packages.list.success),
        data: items.map((item) => ({
          id: item.id,
          title: item.title,
          thumbnail: getPackageThumbnailUrl(item.thumbnail),
          durationMinutes: item.durationMinutes,
          stats: {
            activeQuestions: item.activeQuestions,
            activeSections: item.activeSections,
          },
          category: {
            name: item.categoryName || "",
          },
          grade: {
            name: item.gradeName || "",
          },
          userInteraction: {
            status: (item.status as any) || EnumExamPackageUserStatus.NOT_STARTED,
            completedSectionsCount: item.completedSectionsCount || 0,
          },
          createdAt: item.createdAt.toISOString(),
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

export default listCustomRoute;
