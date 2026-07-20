import { db } from "../../../../db/db-pool.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { examQuestions } from "../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";

export async function deleteSubjectService(id: string): Promise<ServiceResponse> {
  const existingSubject = await db.query.examSubjects.findFirst({
    where: eq(examSubjects.id, id),
  });

  if (!existingSubject) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.subjects.delete.notFound };
  }

  const inUseCheck = await db.query.examQuestions.findFirst({
    where: eq(examQuestions.subjectId, id),
  });

  if (inUseCheck) {
    return { success: false, statusCode: 409, errorKey: ($) => $.exam.subjects.delete.inUse };
  }

  await db.delete(examSubjects).where(eq(examSubjects.id, id));
  return { success: true };
}
