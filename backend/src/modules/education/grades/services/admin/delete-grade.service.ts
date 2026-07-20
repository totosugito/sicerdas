import { db } from "../../../../../db/db-pool.ts";
import { educationGrades } from "../../../../../db/schema/education/grades.ts";
import { books } from "../../../../../db/schema/book/books.ts";
import { examPackages } from "../../../../../db/schema/exam/packages.ts";
import { examQuestions } from "../../../../../db/schema/exam/questions.ts";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";

export async function deleteGradeService(id: number): Promise<ServiceResponse> {
  const existingGrade = await db.query.educationGrades.findFirst({ where: eq(educationGrades.id, id) });

  if (!existingGrade) {
    return { success: false, statusCode: 404, errorKey: ($) => $.education.grades.delete.notFound };
  }

  const bookUsage = await db.query.books.findFirst({ where: eq(books.educationGradeId, id) });
  if (bookUsage) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.grades.delete.inUseBook };
  }

  const packageUsage = await db.query.examPackages.findFirst({ where: eq(examPackages.educationGradeId, id) });
  if (packageUsage) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.grades.delete.inUsePackage };
  }

  const questionUsage = await db.query.examQuestions.findFirst({ where: eq(examQuestions.educationGradeId, id) });
  if (questionUsage) {
    return { success: false, statusCode: 409, errorKey: ($) => $.education.grades.delete.inUseQuestion };
  }

  await db.delete(educationGrades).where(eq(educationGrades.id, id));
  return { success: true };
}
