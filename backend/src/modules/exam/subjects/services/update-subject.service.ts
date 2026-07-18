import { db } from "../../../../db/db-pool.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { eq, and, ne } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { UpdateSubjectParams, SubjectData } from "../education.schema.ts";

export interface UpdateSubjectResult extends ServiceResponse {
  data?: SubjectData;
}

export async function updateSubjectService(
  id: string,
  params: UpdateSubjectParams,
): Promise<UpdateSubjectResult> {
  const existingSubject = await db.query.examSubjects.findFirst({
    where: eq(examSubjects.id, id),
  });

  if (!existingSubject) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.subjects.update.notFound };
  }

  if (params.name) {
    const nameConflict = await db.query.examSubjects.findFirst({
      where: and(eq(examSubjects.name, params.name), ne(examSubjects.id, id)),
    });
    if (nameConflict) {
      return { success: false, statusCode: 409, errorKey: ($) => $.exam.subjects.update.exists };
    }
  }

  const [updatedSubject] = await db
    .update(examSubjects)
    .set({ name: params.name ?? existingSubject.name, description: params.description, isActive: params.isActive, updatedAt: new Date() })
    .where(eq(examSubjects.id, id))
    .returning();

  return {
    success: true,
    data: {
      ...updatedSubject,
      createdAt: updatedSubject.createdAt.toISOString(),
      updatedAt: updatedSubject.updatedAt.toISOString(),
    },
  };
}
