import { db } from "../../../../db/db-pool.ts";
import { examPackageSections, examPackages, examSessions } from "../../../../db/schema/exam/index.ts";
import { EnumExamSessionStatus, EnumExamSessionMode } from "../../../../db/schema/exam/enums.ts";
import { and, desc, eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { ListSectionParams, PublicSectionItemT } from "../package-sections.schema.ts";

export interface ListSectionResult extends ServiceResponse {
  data?: PublicSectionItemT[];
}

export async function listSectionService(
  params: ListSectionParams,
  userId?: string,
): Promise<ListSectionResult> {
  const { packageId } = params;

  const pkg = await db.query.examPackages.findFirst({
    where: and(eq(examPackages.id, packageId), eq(examPackages.isActive, true)),
    columns: { id: true },
  });

  if (!pkg) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.exam.packages.detail.notFound,
    };
  }

  const sectionColumns = {
    id: examPackageSections.id,
    title: examPackageSections.title,
    groupName: examPackageSections.groupName,
    description: examPackageSections.description,
    durationMinutes: examPackageSections.durationMinutes,
    totalQuestions: examPackageSections.totalQuestions,
    activeQuestions: examPackageSections.activeQuestions,
    order: examPackageSections.order,
  };

  let sections;

  if (userId) {
    const latestSessions = db
      .selectDistinctOn([examSessions.sectionId], {
        sectionId: examSessions.sectionId,
        status: examSessions.status,
        mode: examSessions.mode,
      })
      .from(examSessions)
      .where(eq(examSessions.userId, userId))
      .orderBy(
        examSessions.sectionId,
        sql`CASE WHEN ${examSessions.status} = ${EnumExamSessionStatus.IN_PROGRESS} THEN 0 ELSE 1 END`,
        desc(examSessions.createdAt),
      )
      .as("latest");

    const bestScores = db
      .select({
        sectionId: examSessions.sectionId,
        score: sql<number>`MAX(${examSessions.score})::float`.as("score"),
      })
      .from(examSessions)
      .where(
        and(eq(examSessions.userId, userId), eq(examSessions.mode, EnumExamSessionMode.TRYOUT)),
      )
      .groupBy(examSessions.sectionId)
      .as("best");

    sections = await db
      .select({
        ...sectionColumns,
        userStatus: latestSessions.status,
        userMode: latestSessions.mode,
        bestTryoutScore: bestScores.score,
      })
      .from(examPackageSections)
      .leftJoin(latestSessions, eq(latestSessions.sectionId, examPackageSections.id))
      .leftJoin(bestScores, eq(bestScores.sectionId, examPackageSections.id))
      .where(
        and(
          eq(examPackageSections.packageId, packageId),
          eq(examPackageSections.isActive, true),
        ),
      )
      .orderBy(examPackageSections.order);
  } else {
    sections = await db
      .select({
        ...sectionColumns,
        userStatus: sql`NULL`,
        userMode: sql`NULL`,
        bestTryoutScore: sql`NULL`,
      })
      .from(examPackageSections)
      .where(
        and(
          eq(examPackageSections.packageId, packageId),
          eq(examPackageSections.isActive, true),
        ),
      )
      .orderBy(examPackageSections.order);
  }

  return {
    success: true,
    data: sections as PublicSectionItemT[],
  };
}
