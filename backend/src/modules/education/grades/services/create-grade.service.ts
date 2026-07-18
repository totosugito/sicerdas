import { db } from "../../../../db/db-pool.ts";
import { educationGrades } from "../../../../db/schema/education/grades.ts";
import { eq, or } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CreateGradeParams, GradeData } from "../education.schema.ts";

export interface CreateGradeResult extends ServiceResponse {
  data?: GradeData;
}

export async function createGradeService(params: CreateGradeParams, userId: string): Promise<CreateGradeResult> {
  const existingGrade = await db.query.educationGrades.findFirst({
    where: or(eq(educationGrades.grade, params.grade), eq(educationGrades.name, params.name)),
  });

  if (existingGrade) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.grades.create.exists };
  }

  const [newGrade] = await db
    .insert(educationGrades)
    .values({
      grade: params.grade,
      name: params.name,
      desc: params.desc ?? "",
      extra: params.extra ?? {},
      createdByUserId: userId,
      isDefault: params.isDefault ?? true,
    })
    .returning();

  return {
    success: true,
    data: {
      ...newGrade,
      isDefault: newGrade.isDefault ?? true,
      createdAt: newGrade.createdAt ? newGrade.createdAt.toISOString() : null,
      updatedAt: newGrade.updatedAt ? newGrade.updatedAt.toISOString() : null,
    },
  };
}
