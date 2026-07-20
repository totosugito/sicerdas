import { db } from "../../../../../db/db-pool.ts";
import { examPackageQuestions } from "../../../../../db/schema/exam/package-questions.ts";
import { examQuestions } from "../../../../../db/schema/exam/questions.ts";
import { examPackageSections } from "../../../../../db/schema/exam/package-sections.ts";
import { examSubjects } from "../../../../../db/schema/exam/subjects.ts";
import { eq, and, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { PackageQuestionListParams, PackageQuestionItemT } from "../../package-questions.schema.ts";

export interface PackageQuestionListResult extends ServiceResponse {
  data?: {
    items: PackageQuestionItemT[];
    meta: PaginationMeta;
  };
}

export async function packageQuestionListService(
  params: PackageQuestionListParams,
): Promise<PackageQuestionListResult> {
  const { packageId, sectionId, page = 1, limit = 10 } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(examPackageQuestions.packageId, packageId)];
  if (sectionId) conditions.push(eq(examPackageQuestions.sectionId, sectionId));

  const baseQuery = db
    .select({
      packageId: examPackageQuestions.packageId,
      sectionId: examPackageQuestions.sectionId,
      questionId: examPackageQuestions.questionId,
      order: examPackageQuestions.order,
      question: {
        id: examQuestions.id,
        content: examQuestions.content,
        type: examQuestions.type,
        difficulty: examQuestions.difficulty,
        subjectName: examSubjects.name,
      },
      section: {
        id: examPackageSections.id,
        title: examPackageSections.title,
      },
    })
    .from(examPackageQuestions)
    .innerJoin(examQuestions, eq(examPackageQuestions.questionId, examQuestions.id))
    .leftJoin(examSubjects, eq(examQuestions.subjectId, examSubjects.id))
    .leftJoin(examPackageSections, eq(examPackageQuestions.sectionId, examPackageSections.id))
    .where(and(...conditions))
    .orderBy(examPackageQuestions.order);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(baseQuery.as("subquery"));

  const total = Number(countResult[0]?.count || 0);
  const items = await baseQuery.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((item) => ({
        ...item,
        section: item.section?.id ? item.section : undefined,
      })) as PackageQuestionItemT[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
}
