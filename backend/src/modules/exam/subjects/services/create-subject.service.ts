import { db } from "../../../../db/db-pool.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { CreateSubjectParams, SubjectData } from "../education.schema.ts";

export interface CreateSubjectResult extends ServiceResponse {
  data?: SubjectData;
}

export async function createSubjectService(
  params: CreateSubjectParams,
  userId: string,
): Promise<CreateSubjectResult> {
  const existingSubject = await db.query.examSubjects.findFirst({
    where: eq(examSubjects.name, params.name),
  });

  if (existingSubject) {
    return { success: false, statusCode: 409, errorKey: ($) => $.exam.subjects.create.exists };
  }

  const [newSubject] = await db
    .insert(examSubjects)
    .values({
      name: params.name,
      description: params.description,
      isActive: params.isActive ?? true,
      createdByUserId: userId,
    })
    .returning();

  return {
    success: true,
    data: {
      ...newSubject,
      createdAt: newSubject.createdAt.toISOString(),
      updatedAt: newSubject.updatedAt.toISOString(),
    },
  };
}
