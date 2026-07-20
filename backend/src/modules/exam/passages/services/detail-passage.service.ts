import { db } from "../../../../db/db-pool.ts";
import { examPassages } from "../../../../db/schema/exam/passages.ts";
import { examSubjects } from "../../../../db/schema/exam/subjects.ts";
import { eq, getTableColumns } from "drizzle-orm";
import { resolveBlockNoteUrls } from "../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../types/index.ts";
import type { PassageResponseItemT } from "../passages.schema.ts";

export interface DetailPassageResult extends ServiceResponse {
  data?: PassageResponseItemT;
}

export async function detailPassageService(
  id: string,
): Promise<DetailPassageResult> {
  // Fetch passage with subject name
  const passage = await db
    .select({
      ...getTableColumns(examPassages),
      subjectName: examSubjects.name,
    })
    .from(examPassages)
    .leftJoin(examSubjects, eq(examPassages.subjectId, examSubjects.id))
    .where(eq(examPassages.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!passage) {
    return { success: false, statusCode: 404, errorKey: ($) => $.exam.passages.update.notFound };
  }

  return {
    success: true,
    data: {
      ...passage,
      content: resolveBlockNoteUrls(passage.content as Record<string, unknown>[]),
      subjectName: passage.subjectName || "",
      createdAt: passage.createdAt.toISOString(),
      updatedAt: passage.updatedAt.toISOString(),
    },
  };
}
