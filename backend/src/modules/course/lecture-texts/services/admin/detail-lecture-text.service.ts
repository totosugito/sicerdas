import { db } from "../../../../../db/db-pool.ts";
import { courseLectureTexts } from "../../../../../db/schema/course/lecture-texts.ts";
import { eq } from "drizzle-orm";
import { resolveBlockNoteUrls } from "../../../../../utils/blocknote/blocknote-utils.ts";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { LectureTextItem } from "../../lecture-texts.schema.ts";

export interface DetailLectureTextResult extends ServiceResponse {
  data?: LectureTextItem;
}

export async function detailLectureTextService(id: string): Promise<DetailLectureTextResult> {
  const [item] = await db
    .select()
    .from(courseLectureTexts)
    .where(eq(courseLectureTexts.id, id))
    .limit(1);

  if (!item) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.course.lectureTexts.notFound,
    };
  }

  return {
    success: true,
    data: {
      ...item,
      content: resolveBlockNoteUrls(item.content),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    },
  };
}
