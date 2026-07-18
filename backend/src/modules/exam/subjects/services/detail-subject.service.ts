import { db } from "../../../../db/db-pool.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { eq, and } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { SubjectData } from "../education.schema.ts";

export interface DetailSubjectResult extends ServiceResponse {
  data?: SubjectData;
}

export async function detailSubjectService(
  id: string,
  isAdmin: boolean,
): Promise<DetailSubjectResult> {
  const conditions = [eq(examSubjects.id, id)];
  if (!isAdmin) conditions.push(eq(examSubjects.isActive, true));

  const subject = await db.query.examSubjects.findFirst({
    where: and(...conditions),
  });

  if (!subject) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.subjects.detail.notFound };
  }

  return {
    success: true,
    data: {
      ...subject,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    },
  };
}
