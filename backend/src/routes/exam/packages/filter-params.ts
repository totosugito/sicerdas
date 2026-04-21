import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { withErrorHandler } from "../../../utils/withErrorHandler.ts";
import { db } from "../../../db/db-pool.ts";
import {
  educationCategories,
  educationGrades,
  educationCategoryGradeStats,
} from "../../../db/schema/education/index.ts";
import { eq, and, gt } from "drizzle-orm";
import { EnumContentType } from "../../../db/schema/enum/enum-app.ts";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getTypedI18n } from "../../../utils/i18n-typed.ts";

const FilterParamsResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  key: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  grades: Type.Array(
    Type.Object({
      id: Type.Number(),
      name: Type.String(),
      stats: Type.Object({
        activeCount: Type.Number(),
        totalCount: Type.Number(),
      }),
    }),
  ),
});

const FilterParamsResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Array(FilterParamsResponseItem),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: "/filter-params",
    method: "GET",
    schema: {
      tags: ["Exam Packages"],
      summary: "Get filter parameters for exam packages",
      description: "Get all education categories and their grades that have active exam packages",
      response: {
        200: FilterParamsResponse,
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
      req: FastifyRequest,
      reply: FastifyReply,
    ): Promise<typeof FilterParamsResponse.static> {
      const { t } = getTypedI18n(req);

      // Query categories and their related grade stats
      const result = await db
        .select({
          categoryId: educationCategories.id,
          categoryName: educationCategories.name,
          categoryKey: educationCategories.key,
          categoryDescription: educationCategories.description,
          gradeId: educationGrades.id,
          gradeName: educationGrades.name,
          activeCount: educationCategoryGradeStats.activeCount,
          totalCount: educationCategoryGradeStats.totalCount,
        })
        .from(educationCategories)
        .innerJoin(
          educationCategoryGradeStats,
          and(
            eq(educationCategoryGradeStats.categoryId, educationCategories.id),
            eq(educationCategoryGradeStats.contentType, EnumContentType.EXAM),
            gt(educationCategoryGradeStats.activeCount, 0),
          ),
        )
        .innerJoin(
          educationGrades,
          eq(educationGrades.id, educationCategoryGradeStats.educationGradeId),
        )
        .orderBy(educationCategories.name, educationGrades.id);

      // Group results by category
      const categoriesMap = new Map<string, typeof FilterParamsResponseItem.static>();

      for (const row of result) {
        if (!categoriesMap.has(row.categoryId)) {
          categoriesMap.set(row.categoryId, {
            id: row.categoryId,
            name: row.categoryName,
            key: row.categoryKey,
            description: row.categoryDescription,
            grades: [],
          });
        }

        const category = categoriesMap.get(row.categoryId)!;
        category.grades.push({
          id: row.gradeId,
          name: row.gradeName,
          stats: {
            activeCount: row.activeCount,
            totalCount: row.totalCount,
          },
        });
      }

      return reply.status(200).send({
        success: true,
        message: t(($) => $.exam.packages.list.success), // Reuse list success message or create new one
        data: Array.from(categoriesMap.values()),
      });
    }),
  });
};

export default publicRoute;
