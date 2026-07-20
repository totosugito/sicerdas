import { db } from "../../../../../db/db-pool.ts";
import { educationGrades } from "../../../../../db/schema/education/grades.ts";
import { eq, and, ne } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { UpdateGradeParams, GradeData } from "../../education.schema.ts";

export interface UpdateGradeResult extends ServiceResponse {
  data?: GradeData;
}

export async function updateGradeService(id: number, params: UpdateGradeParams): Promise<UpdateGradeResult> {
  const existingGrade = await db.query.educationGrades.findFirst({ where: eq(educationGrades.id, id) });

  if (!existingGrade) {
    return { success: false, statusCode: 404, errorKey: ($) => $.education.grades.update.notFound };
  }

  if (params.name) {
    const nameConflict = await db.query.educationGrades.findFirst({
      where: and(eq(educationGrades.name, params.name), ne(educationGrades.id, id)),
    });
    if (nameConflict) {
      return { success: false, statusCode: 409, errorKey: ($) => $.education.grades.update.exists };
    }
  }

  const [updatedGrade] = await db
    .update(educationGrades)
    .set({ name: params.name, desc: params.desc, extra: params.extra, isDefault: params.isDefault, updatedAt: new Date() })
    .where(eq(educationGrades.id, id))
    .returning();

  return {
    success: true,
    data: {
      ...updatedGrade,
      isDefault: updatedGrade.isDefault ?? true,
      createdAt: updatedGrade.createdAt ? updatedGrade.createdAt.toISOString() : null,
      updatedAt: updatedGrade.updatedAt ? updatedGrade.updatedAt.toISOString() : null,
    },
  };
}
