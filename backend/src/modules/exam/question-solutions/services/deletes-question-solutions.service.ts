import { db } from "../../../../db/db-pool.ts";
import { examQuestionSolutions } from "../../../../db/schema/exam/question-solutions.ts";
import { inArray } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/index.ts";

export async function deletesQuestionSolutionsService(
  ids: string[],
): Promise<ServiceResponse> {
  // Perform Hard Delete for all provided IDs
  await db.delete(examQuestionSolutions).where(inArray(examQuestionSolutions.id, ids));

  return { success: true };
}
